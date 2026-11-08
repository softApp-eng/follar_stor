import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import { Product, GarmentType, Size, Category } from '../../core/models/product';
import { UiService } from '../../core/services/ui.service';
import { SettingsService } from '../../core/services/settings.service';
import { GarmentComponent } from '../../shared/components/garment/garment';
import { PieceOrbitComponent } from '../../shared/components/piece-orbit/piece-orbit';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface MaterialGroup {
  label: string;
  detail: string;
  items: string[];
}

@Component({
  selector: 'app-home',
  imports: [
    PieceOrbitComponent,
    ProductCardComponent,
    GarmentComponent,
    RevealDirective,
    MagneticDirective,
    RouterLink,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  readonly ui = inject(UiService);
  readonly catalog = inject(CatalogService);
  readonly cart = inject(CartService);
  readonly settings = inject(SettingsService);

  readonly categories = computed(() => this.catalog.categories());
  readonly families = computed(() =>
    this.catalog.categories().filter((cat): cat is string => cat !== 'Tous'),
  );
  readonly activeCategory = computed(() => this.catalog.activeCategory());
  readonly filtered = computed(() => this.catalog.filteredProducts());
  readonly featured = computed(() => this.catalog.products()[0] || this.catalog.products()[0]);

  // --- CUSTOMIZER STATE ---
  readonly customizer = signal({
    name: 'Pièce Sur-Mesure',
    garment: 'coat' as GarmentType,
    category: 'Femme' as Category,
    size: 'M' as Size,
    material: '100% Laine mérinos',
    fit: 'Coupe sur-mesure',
    price: 130,
    color: '#c9a06a',
    colorBg: 'linear-gradient(180deg, #f4f1ea 0%, #e7dfd2 100%)',
  });

  updateCustomizer(field: string, value: any): void {
    this.customizer.update((c) => ({ ...c, [field]: value }));
  }

  /** Photo choisie dans l'admin pour la silhouette en cours, si elle existe. */
  readonly customizerImage = computed(() => {
    const images = this.settings.settings().customizerImages ?? {};
    return images[this.customizer().garment] || '';
  });

  readonly previewCustomProduct = computed<Product>(() => {
    const c = this.customizer();
    return {
      slug: 'preview-custom',
      name: c.name || 'Pièce Sur-Mesure',
      line: 'Sur-Mesure',
      category: c.category,
      garment: c.garment,
      tagline: 'Votre création unique.',
      description: 'Pièce personnalisée par vos soins dans nos ateliers.',
      story: 'Confectionnée sur commande selon vos spécifications exactes.',
      price: c.price,
      material: c.material,
      fit: 'Sur-mesure',
      care: 'Entretien atelier',
      origin: 'Atelier de Paris',
      season: 'Toute l’année',
      badge: 'Sur-mesure',
      imageUrl: this.customizerImage() || undefined,
      palette: {
        aura: c.color,
        fabricA: c.color,
        fabricB: '#111110',
        accent: '#d93a2b',
        bg: c.colorBg,
      },
      details: {
        material: [c.material],
        fit: ['Sur-mesure'],
        finish: ['Broderie personnalisée'],
      },
    };
  });

  addCustomToCart(event: Event): void {
    event.preventDefault();
    const c = this.customizer();
    const product = this.previewCustomProduct();
    const customProduct: Product = {
      ...product,
      slug: `sur-mesure-${Date.now().toString().slice(-4)}`,
    };

    this.catalog.addProduct(customProduct);
    this.cart.add(customProduct, c.size, 1);
    this.ui.showToast(`Création "${customProduct.name}" (taille ${c.size}) ajoutée au panier !`);
    this.ui.openCart();
  }

  readonly marqueeWords = [
    'Laine mérinos',
    'Lin lavé',
    'Denim selvedge',
    'Cachemire',
    'Gabardine',
    'Coton bio',
    'Cuir pleine fleur',
    'Soie',
  ];

  readonly materialGroups = computed<MaterialGroup[]>(() => {
    const f = this.featured();
    const details = f?.details || {
      material: ['Laine mérinos', 'Duvet'],
      fit: ['Coupe droite'],
      finish: ['Boutons corne'],
    };
    return [
      {
        label: 'Matières',
        detail: details.material[0] || 'Matière naturelle',
        items: details.material,
      },
      {
        label: 'Coupe',
        detail: details.fit[0] || 'Coupe ajustée',
        items: details.fit,
      },
      {
        label: 'Finitions',
        detail: details.finish[0] || 'Finition soignée',
        items: details.finish,
      },
    ];
  });

  readonly stats = [
    { value: '1998', label: 'Naissance à Paris' },
    { value: '8+', label: 'Pièces au vestiaire' },
    { value: '100%', label: 'Matières naturelles' },
  ];

  readonly vestiaire = [
    {
      title: 'Choisir',
      text: "Une pièce à la fois. La coupe avant la couleur, la matière avant l'étiquette. Rien n'entre au vestiaire sans avoir été porté une semaine.",
    },
    {
      title: 'Porter',
      text: "Sans y penser. Les pièces FOLLAR sont dessinées pour le quotidien : elles se froissent, se lavent, se portent encore.",
    },
    {
      title: 'Garder',
      text: "Réparer plutôt que remplacer. Nos ateliers reprennent les coutures, les boutons et les ourlets, saison après saison.",
    },
  ];

  readonly services = [
    {
      title: 'Livraison 48 h',
      text: 'Offerte dès 90 € en France',
      icon: 'truck',
    },
    {
      title: 'Retours 30 jours',
      text: 'Simples et sans frais',
      icon: 'return',
    },
    {
      title: 'Retouches offertes',
      text: 'En atelier, sur rendez-vous',
      icon: 'sample',
    },
    {
      title: 'Paiement sécurisé',
      text: 'Cartes, Apple Pay, PayPal',
      icon: 'lock',
    },
  ];

  readonly newsletterEmail = signal('');
  readonly newsletterDone = signal(false);

  setCategory(category: string): void {
    this.catalog.activeCategory.set(category);
  }

  countFor(category: string): number {
    return this.catalog.countFor(category);
  }

  onEmail(event: Event): void {
    this.newsletterEmail.set((event.target as HTMLInputElement).value);
  }

  subscribe(event: Event): void {
    event.preventDefault();
    const email = this.newsletterEmail().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.ui.showToast('Merci de saisir une adresse e-mail valide.');
      return;
    }
    this.newsletterDone.set(true);
    this.ui.showToast('Bienvenue dans le cercle FOLLAR.');
  }
}
