import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { CatalogService } from '../../core/services/catalog.service';
import { OrderService, Order } from '../../core/services/order.service';
import { SettingsService } from '../../core/services/settings.service';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';
import { Product, GarmentType } from '../../core/models/product';
import { GarmentComponent } from '../../shared/components/garment/garment';

type AdminTab = 'dashboard' | 'articles' | 'categories' | 'orders' | 'appearance' | 'social';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, GarmentComponent, DatePipe, UpperCasePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent {
  readonly catalog = inject(CatalogService);
  readonly orderService = inject(OrderService);
  readonly settingsService = inject(SettingsService);
  readonly auth = inject(AuthService);
  readonly ui = inject(UiService);

  readonly activeTab = signal<AdminTab>('dashboard');
  readonly Number = Number;

  // --- LOGIN FORM STATE ---
  readonly loginUsername = signal('admin');
  readonly loginPassword = signal('follar2026');
  readonly loginError = signal(false);

  // --- ARTICLES STATE ---
  readonly editingSlug = signal<string | null>(null);
  readonly articleForm = signal<{
    name: string;
    line: string;
    category: string;
    garment: GarmentType;
    tagline: string;
    description: string;
    story: string;
    price: number;
    material: string;
    fit: string;
    care: string;
    origin: string;
    season: string;
    badge: string;
    imageUrl: string;
    aura: string;
    fabricA: string;
    fabricB: string;
    accent: string;
    bg: string;
    materialDetails: string;
    fitDetails: string;
    finishDetails: string;
  }>({
    name: '',
    line: 'Essentiels',
    category: 'Femme',
    garment: 'shirt',
    tagline: 'Une pièce d’exception.',
    description: 'Description de la pièce...',
    story: 'Histoire et provenance...',
    price: 85,
    material: '100 % coton bio',
    fit: 'Coupe droite',
    care: 'Lavage 30°',
    origin: 'Confectionné au Portugal',
    season: 'Toute l’année',
    badge: 'Nouveauté',
    imageUrl: '',
    aura: '#c9a06a',
    fabricA: '#b07d4e',
    fabricB: '#7a5330',
    accent: '#3d2c1c',
    bg: 'linear-gradient(180deg, #f4f1ea 0%, #e7dfd2 100%)',
    materialDetails: 'Coton bio, Jersey',
    fitDetails: 'Coupe droite, Col rond',
    finishDetails: 'Double surpiqûre, Bouton nacré',
  });

  readonly showArticleModal = signal(false);

  // --- CATEGORY STATE ---
  readonly newCategoryName = signal('');

  // --- ORDER DETAIL STATE ---
  readonly selectedOrder = signal<Order | null>(null);

  // --- PRINT ARTICLE STATE ---
  readonly printingArticle = signal<Product | null>(null);

  // --- APPEARANCE & SOCIAL STATE ---
  readonly settingsForm = signal(this.settingsService.settings());

  // --- STATS ---
  readonly totalRevenue = computed(() =>
    this.orderService.orders().reduce((sum, o) => sum + o.total, 0),
  );

  readonly totalOrders = computed(() => this.orderService.orders().length);
  readonly pendingDeliveries = computed(
    () => this.orderService.orders().filter((o) => o.status === 'Nouveau').length,
  );
  readonly totalArticles = computed(() => this.catalog.products().length);

  handleLogin(event: Event): void {
    event.preventDefault();
    const success = this.auth.login(this.loginUsername(), this.loginPassword());
    if (success) {
      this.loginError.set(false);
      this.ui.showToast('Connexion JWT réussie — Bienvenue dans l’administration.');
    } else {
      this.loginError.set(true);
      this.ui.showToast('Identifiants incorrects (Essayez admin / follar2026).');
    }
  }

  logout(): void {
    this.auth.logout();
    this.ui.showToast('Déconnexion effectuée.');
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  // --- ARTICLE METHODS ---
  openAddArticleModal(): void {
    this.editingSlug.set(null);
    this.articleForm.set({
      name: '',
      line: 'Essentiels',
      category: this.catalog.categories()[1] || 'Femme',
      garment: 'shirt',
      tagline: 'Une pièce d’exception.',
      description: 'Description minutieuse de la pièce.',
      story: 'Confectionné avec soin en atelier.',
      price: 85,
      material: '100 % coton bio',
      fit: 'Coupe droite',
      care: 'Lavage 30°',
      origin: 'Confectionné en Europe',
      season: 'Toute l’année',
      badge: 'Nouveauté',
      imageUrl: '',
      aura: '#c9a06a',
      fabricA: '#b07d4e',
      fabricB: '#7a5330',
      accent: '#3d2c1c',
      bg: 'linear-gradient(180deg, #f4f1ea 0%, #e7dfd2 100%)',
      materialDetails: 'Coton bio, Laine',
      fitDetails: 'Coupe droite, Épaules souples',
      finishDetails: 'Boutons corne, Surpiqûre',
    });
    this.showArticleModal.set(true);
  }

  openEditArticleModal(p: Product): void {
    this.editingSlug.set(p.slug);
    this.articleForm.set({
      name: p.name,
      line: p.line,
      category: p.category,
      garment: p.garment,
      tagline: p.tagline,
      description: p.description,
      story: p.story,
      price: p.price,
      material: p.material,
      fit: p.fit,
      care: p.care,
      origin: p.origin,
      season: p.season,
      badge: p.badge || '',
      imageUrl: p.imageUrl || '',
      aura: p.palette.aura,
      fabricA: p.palette.fabricA,
      fabricB: p.palette.fabricB,
      accent: p.palette.accent,
      bg: p.palette.bg,
      materialDetails: p.details.material.join(', '),
      fitDetails: p.details.fit.join(', '),
      finishDetails: p.details.finish.join(', '),
    });
    this.showArticleModal.set(true);
  }

  saveArticle(event: Event): void {
    event.preventDefault();
    const f = this.articleForm();
    if (!f.name.trim()) {
      this.ui.showToast('Veuillez saisir un nom pour l’article.');
      return;
    }

    const slug =
      this.editingSlug() ||
      f.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const product: Product = {
      slug,
      name: f.name.trim(),
      line: f.line.trim() || 'Essentiels',
      category: f.category as any,
      garment: f.garment,
      tagline: f.tagline.trim(),
      description: f.description.trim(),
      story: f.story.trim(),
      price: Number(f.price) || 50,
      material: f.material.trim(),
      fit: f.fit.trim(),
      care: f.care.trim(),
      origin: f.origin.trim(),
      season: f.season.trim(),
      badge: f.badge.trim() || undefined,
      imageUrl: f.imageUrl.trim() || undefined,
      palette: {
        aura: f.aura,
        fabricA: f.fabricA,
        fabricB: f.fabricB,
        accent: f.accent,
        bg: f.bg,
      },
      details: {
        material: f.materialDetails.split(',').map((s) => s.trim()).filter(Boolean),
        fit: f.fitDetails.split(',').map((s) => s.trim()).filter(Boolean),
        finish: f.finishDetails.split(',').map((s) => s.trim()).filter(Boolean),
      },
    };

    if (this.editingSlug()) {
      this.catalog.updateProduct(slug, product);
      this.ui.showToast(`Article "${product.name}" mis à jour avec succès.`);
    } else {
      this.catalog.addProduct(product);
      this.ui.showToast(`Nouvel article "${product.name}" ajouté et publié sur le site.`);
    }

    this.showArticleModal.set(false);
  }

  deleteArticle(slug: string, name: string): void {
    if (confirm(`Voulez-vous vraiment supprimer l'article "${name}" ?`)) {
      this.catalog.deleteProduct(slug);
      this.ui.showToast(`Article "${name}" supprimé.`);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.articleForm.update((f) => ({ ...f, imageUrl: result }));
          this.ui.showToast('Image chargée avec succès.');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  printArticle(p: Product): void {
    this.printingArticle.set(p);
  }

  triggerWindowPrint(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  // --- CATEGORY METHODS ---
  addCategory(event: Event): void {
    event.preventDefault();
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.catalog.addCategory(name);
    this.newCategoryName.set('');
    this.ui.showToast(`Catégorie "${name}" ajoutée.`);
  }

  deleteCategory(cat: string): void {
    if (confirm(`Supprimer la catégorie "${cat}" ?`)) {
      this.catalog.deleteCategory(cat);
      this.ui.showToast(`Catégorie "${cat}" supprimée.`);
    }
  }

  // --- ORDER METHODS ---
  sendToDelivery(id: string): void {
    this.orderService.sendToDelivery(id);
    this.ui.showToast(`Commande ${id} transmise au département livraison.`);
  }

  deleteOrder(id: string): void {
    if (confirm(`Supprimer la commande ${id} ?`)) {
      this.orderService.deleteOrder(id);
      this.ui.showToast(`Commande ${id} supprimée.`);
    }
  }

  createTestOrder(): void {
    const sampleProducts = this.catalog.products();
    const p = sampleProducts[Math.floor(Math.random() * sampleProducts.length)] || sampleProducts[0];
    const order = this.orderService.createOrder(
      [
        {
          slug: p.slug,
          name: p.name,
          size: 'M',
          qty: 1,
          unitPrice: p.price,
          total: p.price,
        },
      ],
      p.price,
      p.price >= 90 ? 0 : 6,
      p.price + (p.price >= 90 ? 0 : 6),
      {
        fullName: 'Thomas Bernard',
        email: 'thomas.bernard@exemple.fr',
        address: '8 boulevard Saint-Germain',
        city: 'Paris',
        postalCode: '75005',
        country: 'France',
        notes: 'Livraison en matinée si possible.',
      },
    );
    this.ui.showToast(`Nouvelle commande de test ${order.id} créée !`);
  }

  // --- APPEARANCE & SOCIAL METHODS ---
  saveSettings(event: Event): void {
    event.preventDefault();
    this.settingsService.update(this.settingsForm());
    this.ui.showToast('Paramètres d’apparence et réseaux sociaux enregistrés.');
  }

  resetSettings(): void {
    this.settingsService.reset();
    this.settingsForm.set(this.settingsService.settings());
    this.ui.showToast('Apparence réinitialisée aux valeurs par défaut.');
  }
}
