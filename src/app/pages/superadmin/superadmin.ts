import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { OrderService, Order } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import {
  AccountEvent,
  AccountRole,
  AccountsService,
  AdminAccount,
} from '../../core/services/accounts.service';
import { UiService } from '../../core/services/ui.service';

type SuperTab = 'overview' | 'accounts';
type RoleFilter = 'tous' | AccountRole;
type StatusFilter = 'tous' | 'actifs' | 'inactifs';
type Priority = 'Haute' | 'Moyenne' | 'Idée';

interface AccountForm {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: AccountRole;
  active: boolean;
}

interface Recommendation {
  priority: Priority;
  title: string;
  text: string;
}

interface MonthSales {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  slug: string;
  name: string;
  qty: number;
  revenue: number;
}

const EMPTY_FORM: AccountForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  role: 'admin',
  active: true,
};

@Component({
  selector: 'app-superadmin',
  imports: [RouterLink, DatePipe],
  templateUrl: './superadmin.html',
  styleUrl: './superadmin.scss',
})
export class SuperAdminComponent {
  readonly auth = inject(AuthService);
  readonly accountsService = inject(AccountsService);
  readonly catalog = inject(CatalogService);
  readonly orderService = inject(OrderService);
  readonly ui = inject(UiService);

  readonly activeTab = signal<SuperTab>('overview');

  // --- LOGIN STATE ---
  readonly loginUsername = signal('superadmin');
  readonly loginPassword = signal('superfollar2026');
  readonly loginError = signal('');

  // --- ACCOUNT FORM STATE ---
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly accountForm = signal<AccountForm>({ ...EMPTY_FORM });
  readonly formError = signal('');

  // --- ACCOUNT FILTERS ---
  readonly search = signal('');
  readonly roleFilter = signal<RoleFilter>('tous');
  readonly statusFilter = signal<StatusFilter>('tous');

  readonly eventLabels: Record<AccountEvent['action'], string> = {
    created: 'Création',
    updated: 'Mise à jour',
    activated: 'Activation',
    deactivated: 'Désactivation',
    deleted: 'Suppression',
    password: 'Mot de passe',
  };

  constructor() {
    this.auth.ensureValidSession();
  }

  // --- COUNTERS ---
  readonly totalAccounts = computed(() => this.accountsService.accounts().length);
  readonly activeAccounts = computed(() => this.accountsService.activeAccounts().length);
  readonly inactiveAccounts = computed(() => this.accountsService.inactiveAccounts().length);
  readonly superAdminCount = computed(() => this.accountsService.superAdmins().length);
  readonly totalOrders = computed(() => this.orderService.orders().length);
  readonly pendingOrders = computed(() => this.orderService.pendingCount());
  readonly deliveredOrders = computed(
    () => this.orderService.orders().filter((o) => o.status === 'Livré').length,
  );
  readonly revenue = computed(() =>
    this.orderService.orders().reduce((sum, order) => sum + order.total, 0),
  );
  readonly averageOrder = computed(() => {
    const orders = this.totalOrders();
    return orders ? Math.round(this.revenue() / orders) : 0;
  });
  readonly productCount = computed(() => this.catalog.products().length);
  readonly productsWithoutPhoto = computed(
    () => this.catalog.products().filter((p) => !p.imageUrl).length,
  );
  readonly accountsThisMonth = computed(() => {
    const now = new Date();
    return this.accountsService.accounts().filter((account) => {
      const created = new Date(account.createdAt);
      return (
        created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
      );
    }).length;
  });

  readonly filteredAccounts = computed(() => {
    const query = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return this.accountsService.accounts().filter((account) => {
      const matchesQuery =
        !query ||
        account.username.toLowerCase().includes(query) ||
        account.fullName.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query);
      const matchesRole = role === 'tous' || account.role === role;
      const matchesStatus =
        status === 'tous' ||
        (status === 'actifs' && account.active) ||
        (status === 'inactifs' && !account.active);
      return matchesQuery && matchesRole && matchesStatus;
    });
  });

  readonly monthlySales = computed<MonthSales[]>(() => {
    const now = new Date();
    const months: MonthSales[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
        revenue: 0,
        orders: 0,
      });
    }
    for (const order of this.orderService.orders()) {
      const date = new Date(order.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const bucket = months.find((month) => month.key === key);
      if (bucket) {
        bucket.revenue += order.total;
        bucket.orders += 1;
      }
    }
    return months;
  });

  readonly maxMonthlyRevenue = computed(() =>
    Math.max(1, ...this.monthlySales().map((month) => month.revenue)),
  );

  readonly topProducts = computed<TopProduct[]>(() => {
    const map = new Map<string, TopProduct>();
    for (const order of this.orderService.orders()) {
      for (const item of order.items) {
        const entry = map.get(item.slug) ?? {
          slug: item.slug,
          name: item.name,
          qty: 0,
          revenue: 0,
        };
        entry.qty += item.qty;
        entry.revenue += item.total;
        map.set(item.slug, entry);
      }
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  });

  readonly recentOrders = computed(() => this.orderService.orders().slice(0, 4));
  readonly recentEvents = computed(() => this.accountsService.events().slice(0, 8));

  readonly recommendations = computed<Recommendation[]>(() => {
    const items: Recommendation[] = [];
    const missingPhotos = this.productsWithoutPhoto();

    if (missingPhotos > 0) {
      items.push({
        priority: 'Haute',
        title: 'Compléter les photos produit',
        text: `${missingPhotos} article(s) n’ont pas encore de photo. Une fiche avec 3 à 5 visuels (porté, détail, dos) convertit nettement mieux.`,
      });
    }
    if (this.pendingOrders() > 0) {
      items.push({
        priority: 'Haute',
        title: 'Expédier les commandes en attente',
        text: `${this.pendingOrders()} commande(s) attendent une expédition. Prévenez le client dès la remise au transporteur.`,
      });
    }
    items.push({
      priority: 'Haute',
      title: 'Paiement et livraison réels',
      text: 'Branchez Stripe ou PayPal, ajoutez le suivi de colis et des options de livraison (point relais, express).',
    });
    items.push({
      priority: 'Moyenne',
      title: 'Fiches produit enrichies',
      text: 'Guide des tailles, avis clients vérifiés, disponibilité en temps réel et retours gratuits rassurent avant l’achat.',
    });
    items.push({
      priority: 'Moyenne',
      title: 'E-mails post-achat',
      text: 'Confirmation, expédition, livraison et relance panier abandonné : automatisez ces messages pour fidéliser.',
    });
    items.push({
      priority: 'Idée',
      title: 'Fidélité & seconde main',
      text: 'Programme de fidélité, ventes privées et reprise des pièces FOLLAR pour installer une relation durable.',
    });

    return items.slice(0, 6);
  });

  // --- LOGIN ---
  handleLogin(event: Event): void {
    event.preventDefault();
    const result = this.auth.login(
      this.loginUsername(),
      this.loginPassword(),
      'superadmin',
    );

    if (result.ok) {
      this.loginError.set('');
      this.ui.showToast('Connexion super-admin réussie.');
      return;
    }

    if (result.error === 'inactive') {
      this.loginError.set('Ce compte super-admin a été désactivé.');
    } else if (result.error === 'forbidden') {
      this.loginError.set(
        'Ce compte n’a pas les droits super-admin. Utilisez le panel admin classique.',
      );
    } else {
      this.loginError.set('Identifiants invalides. Utilisez superadmin / superfollar2026.');
    }
    this.ui.showToast('Accès super-admin refusé.');
  }

  logout(): void {
    this.auth.logout();
    this.ui.showToast('Déconnexion effectuée.');
  }

  setTab(tab: SuperTab): void {
    this.activeTab.set(tab);
  }

  // --- ACCOUNT MANAGEMENT ---
  isSelf(account: AdminAccount): boolean {
    return account.username.toLowerCase() === (this.auth.username() ?? '').toLowerCase();
  }

  roleLabel(role: AccountRole): string {
    return role === 'superadmin' ? 'Super-admin' : 'Admin';
  }

  openCreate(): void {
    this.editingId.set(null);
    this.accountForm.set({ ...EMPTY_FORM });
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(account: AdminAccount): void {
    this.editingId.set(account.id);
    this.accountForm.set({
      fullName: account.fullName,
      username: account.username,
      email: account.email,
      password: '',
      role: account.role,
      active: account.active,
    });
    this.formError.set('');
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.accountForm.set({ ...EMPTY_FORM });
    this.formError.set('');
  }

  updateForm(field: keyof AccountForm, value: string | boolean): void {
    this.accountForm.update((form) => ({ ...form, [field]: value }));
  }

  submitAccount(event: Event): void {
    event.preventDefault();
    const form = this.accountForm();
    const actor = this.auth.username() ?? 'super-admin';

    const result = this.editingId()
      ? this.accountsService.updateAccount(
          this.editingId() as string,
          {
            fullName: form.fullName,
            email: form.email,
            role: form.role,
            active: form.active,
            password: form.password || undefined,
          },
          actor,
        )
      : this.accountsService.createAccount(
          {
            username: form.username,
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            role: form.role,
            active: form.active,
          },
          actor,
        );

    if (!result.ok) {
      this.formError.set(result.error ?? 'Impossible d’enregistrer le compte.');
      this.ui.showToast(result.error ?? 'Impossible d’enregistrer le compte.');
      return;
    }

    this.ui.showToast(
      this.editingId()
        ? `Compte "${form.username}" mis à jour.`
        : `Compte "${form.username}" créé.`,
    );
    this.cancelForm();
  }

  toggleActive(account: AdminAccount): void {
    if (this.isSelf(account) && account.active) {
      this.ui.showToast('Vous ne pouvez pas désactiver votre propre compte.');
      return;
    }

    const actor = this.auth.username() ?? 'super-admin';
    const result = this.accountsService.setActive(account.id, !account.active, actor);
    if (!result.ok) {
      this.ui.showToast(result.error ?? 'Action impossible.');
      return;
    }
    this.ui.showToast(
      account.active
        ? `Compte "${account.username}" désactivé.`
        : `Compte "${account.username}" activé.`,
    );
  }

  deleteAccount(account: AdminAccount): void {
    if (this.isSelf(account)) {
      this.ui.showToast('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    if (!confirm(`Supprimer définitivement le compte "${account.username}" ?`)) return;

    const result = this.accountsService.deleteAccount(
      account.id,
      this.auth.username() ?? 'super-admin',
    );
    if (!result.ok) {
      this.ui.showToast(result.error ?? 'Suppression impossible.');
      return;
    }
    this.ui.showToast(`Compte "${account.username}" supprimé.`);
  }

  orderStatusClass(status: Order['status']): string {
    switch (status) {
      case 'Nouveau':
        return 'order-status--new';
      case 'Envoyé en livraison':
        return 'order-status--sent';
      case 'Livré':
        return 'order-status--done';
      default:
        return 'order-status--cancel';
    }
  }

  priorityClass(priority: Priority): string {
    switch (priority) {
      case 'Haute':
        return 'haute';
      case 'Moyenne':
        return 'moyenne';
      default:
        return 'idee';
    }
  }

  barHeight(revenue: number): number {
    return Math.max(3, Math.round((revenue / this.maxMonthlyRevenue()) * 100));
  }
}
