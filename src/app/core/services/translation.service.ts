import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Translation {
  [key: string]: string | Translation;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANGUAGE_KEY = 'quinca_language';
  private readonly DEFAULT_LANGUAGE = 'fr';
  private readonly SUPPORTED_LANGUAGES = ['fr', 'en'];

  // Signals for reactive state
  private currentLanguage = signal<string>(this.DEFAULT_LANGUAGE);
  private translations = signal<Translation>({});

  // Computed signals
  language = computed(() => this.currentLanguage());
  isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  initializeLanguage(): void {
    const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY);
    const browserLanguage = navigator.language.split('-')[0];
    
    const language = savedLanguage || 
      (this.SUPPORTED_LANGUAGES.includes(browserLanguage) ? browserLanguage : this.DEFAULT_LANGUAGE);
    
    this.setLanguage(language);
  }

  setLanguage(language: string): void {
    if (!this.SUPPORTED_LANGUAGES.includes(language)) {
      language = this.DEFAULT_LANGUAGE;
    }

    this.currentLanguage.set(language);
    localStorage.setItem(this.LANGUAGE_KEY, language);
    this.loadTranslations(language);
  }

  getLanguage(): string {
    return this.currentLanguage();
  }

  getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  translate(key: string, params?: Record<string, any>): string {
    const translation = this.getNestedTranslation(key);
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Replace parameters in translation
    if (params) {
      return this.interpolateParams(translation, params);
    }

    return translation;
  }

  // Shorthand method
  t(key: string, params?: Record<string, any>): string {
    return this.translate(key, params);
  }

  private loadTranslations(language: string): void {
    this.isLoading.set(true);
    
    // Use mock translations for now
    this.getMockTranslations(language).subscribe({
      next: (translations) => {
        this.translations.set(translations);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load translations:', error);
        this.isLoading.set(false);
      }
    });
  }

  private getNestedTranslation(key: string): string {
    const keys = key.split('.');
    let current: any = this.translations();

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return '';
      }
    }

    return typeof current === 'string' ? current : '';
  }

  private interpolateParams(translation: string, params: Record<string, any>): string {
    return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key].toString() : match;
    });
  }

  // Mock translations - replace with HTTP calls to load from assets/i18n/
  private getMockTranslations(language: string): Observable<Translation> {
    const translations = language === 'fr' ? this.getFrenchTranslations() : this.getEnglishTranslations();
    return of(translations);
  }

  private getFrenchTranslations(): Translation {
    return {
      common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        view: 'Voir',
        add: 'Ajouter',
        search: 'Rechercher',
        filter: 'Filtrer',
        export: 'Exporter',
        import: 'Importer',
        print: 'Imprimer',
        refresh: 'Actualiser',
        loading: 'Chargement...',
        noData: 'Aucune donnée',
        confirm: 'Confirmer',
        yes: 'Oui',
        no: 'Non',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        total: 'Total',
        subtotal: 'Sous-total',
        discount: 'Remise',
        tax: 'TVA',
        quantity: 'Quantité',
        price: 'Prix',
        amount: 'Montant',
        date: 'Date',
        status: 'Statut',
        actions: 'Actions',
        name: 'Nom',
        code: 'Code',
        description: 'Description',
        active: 'Actif',
        inactive: 'Inactif',
        enabled: 'Activé',
        disabled: 'Désactivé'
      },
      auth: {
        login: 'Connexion',
        logout: 'Déconnexion',
        email: 'Email',
        password: 'Mot de passe',
        rememberMe: 'Se souvenir de moi',
        forgotPassword: 'Mot de passe oublié ?',
        signIn: 'Se connecter',
        twoFactor: 'Authentification à deux facteurs',
        enterCode: 'Entrez le code à 6 chiffres',
        verify: 'Vérifier',
        invalidCredentials: 'Identifiants invalides',
        loginSuccess: 'Connexion réussie',
        logoutSuccess: 'Déconnexion réussie'
      },
      navigation: {
        dashboard: 'Tableau de bord',
        products: 'Produits',
        categories: 'Catégories',
        units: 'Unités',
        variants: 'Variantes',
        suppliers: 'Fournisseurs',
        customers: 'Clients',
        purchases: 'Achats',
        sales: 'Ventes',
        pos: 'Point de vente',
        inventory: 'Inventaire',
        movements: 'Mouvements',
        transfers: 'Transferts',
        adjustments: 'Ajustements',
        counts: 'Inventaires',
        warehouses: 'Entrepôts',
        returns: 'Retours',
        damages: 'Pertes & Casse',
        reports: 'Rapports',
        settings: 'Paramètres',
        notifications: 'Notifications',
        profile: 'Profil',
        help: 'Aide'
      },
      dashboard: {
        title: 'Tableau de bord',
        welcome: 'Bienvenue, {{name}}',
        totalStock: 'Stock total',
        todaySales: 'Ventes du jour',
        grossMargin: 'Marge brute',
        lowStock: 'Ruptures imminentes',
        recentSales: 'Ventes récentes',
        topProducts: 'Produits populaires',
        salesChart: 'Évolution des ventes',
        stockAlerts: 'Alertes stock'
      },
      products: {
        title: 'Gestion des produits',
        addProduct: 'Ajouter un produit',
        editProduct: 'Modifier le produit',
        productDetails: 'Détails du produit',
        productName: 'Nom du produit',
        productCode: 'Code produit',
        category: 'Catégorie',
        brand: 'Marque',
        unit: 'Unité',
        purchasePrice: 'Prix d\'achat HT',
        salePrice: 'Prix de vente HT',
        vatRate: 'Taux TVA (%)',
        margin: 'Marge (%)',
        stock: 'Stock',
        threshold: 'Seuil de réappro',
        barcode: 'Code-barres',
        images: 'Images',
        variants: 'Variantes',
        deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce produit ?'
      },
      sales: {
        title: 'Gestion des ventes',
        pos: 'Point de vente',
        newSale: 'Nouvelle vente',
        cart: 'Panier',
        customer: 'Client',
        addToCart: 'Ajouter au panier',
        removeFromCart: 'Retirer du panier',
        payment: 'Paiement',
        cash: 'Espèces',
        card: 'Carte',
        mobileMoney: 'Mobile Money',
        change: 'Monnaie rendue',
        receipt: 'Reçu',
        printReceipt: 'Imprimer le reçu',
        completeSale: 'Finaliser la vente',
        saleCompleted: 'Vente finalisée avec succès'
      },
      inventory: {
        title: 'Gestion d\'inventaire',
        movements: 'Mouvements de stock',
        transfers: 'Transferts',
        adjustments: 'Ajustements',
        stockCount: 'Inventaire physique',
        newTransfer: 'Nouveau transfert',
        sourceWarehouse: 'Entrepôt source',
        destinationWarehouse: 'Entrepôt destination',
        transferItems: 'Articles à transférer',
        currentStock: 'Stock actuel',
        countedStock: 'Stock compté',
        difference: 'Écart'
      },
      settings: {
        title: 'Paramètres',
        company: 'Entreprise',
        users: 'Utilisateurs',
        roles: 'Rôles',
        taxes: 'Taxes',
        numbering: 'Numérotation',
        warehouses: 'Entrepôts',
        general: 'Général',
        companyName: 'Nom de l\'entreprise',
        address: 'Adresse',
        phone: 'Téléphone',
        email: 'Email',
        taxNumber: 'Numéro fiscal',
        currency: 'Devise',
        language: 'Langue',
        theme: 'Thème',
        darkMode: 'Mode sombre',
        lightMode: 'Mode clair'
      },
      messages: {
        saveSuccess: 'Enregistrement réussi',
        saveError: 'Erreur lors de l\'enregistrement',
        deleteSuccess: 'Suppression réussie',
        deleteError: 'Erreur lors de la suppression',
        loadError: 'Erreur lors du chargement',
        networkError: 'Erreur de connexion',
        validationError: 'Erreur de validation',
        accessDenied: 'Accès refusé',
        sessionExpired: 'Session expirée'
      }
    };
  }

  private getEnglishTranslations(): Translation {
    return {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        print: 'Print',
        refresh: 'Refresh',
        loading: 'Loading...',
        noData: 'No data',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        total: 'Total',
        subtotal: 'Subtotal',
        discount: 'Discount',
        tax: 'VAT',
        quantity: 'Quantity',
        price: 'Price',
        amount: 'Amount',
        date: 'Date',
        status: 'Status',
        actions: 'Actions',
        name: 'Name',
        code: 'Code',
        description: 'Description',
        active: 'Active',
        inactive: 'Inactive',
        enabled: 'Enabled',
        disabled: 'Disabled'
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        signIn: 'Sign in',
        twoFactor: 'Two-factor authentication',
        enterCode: 'Enter 6-digit code',
        verify: 'Verify',
        invalidCredentials: 'Invalid credentials',
        loginSuccess: 'Login successful',
        logoutSuccess: 'Logout successful'
      },
      navigation: {
        dashboard: 'Dashboard',
        products: 'Products',
        categories: 'Categories',
        units: 'Units',
        variants: 'Variants',
        suppliers: 'Suppliers',
        customers: 'Customers',
        purchases: 'Purchases',
        sales: 'Sales',
        pos: 'Point of Sale',
        inventory: 'Inventory',
        movements: 'Movements',
        transfers: 'Transfers',
        adjustments: 'Adjustments',
        counts: 'Stock Counts',
        warehouses: 'Warehouses',
        returns: 'Returns',
        damages: 'Damages & Loss',
        reports: 'Reports',
        settings: 'Settings',
        notifications: 'Notifications',
        profile: 'Profile',
        help: 'Help'
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome, {{name}}',
        totalStock: 'Total stock',
        todaySales: 'Today\'s sales',
        grossMargin: 'Gross margin',
        lowStock: 'Low stock alerts',
        recentSales: 'Recent sales',
        topProducts: 'Top products',
        salesChart: 'Sales evolution',
        stockAlerts: 'Stock alerts'
      },
      products: {
        title: 'Product Management',
        addProduct: 'Add product',
        editProduct: 'Edit product',
        productDetails: 'Product details',
        productName: 'Product name',
        productCode: 'Product code',
        category: 'Category',
        brand: 'Brand',
        unit: 'Unit',
        purchasePrice: 'Purchase price (excl. VAT)',
        salePrice: 'Sale price (excl. VAT)',
        vatRate: 'VAT rate (%)',
        margin: 'Margin (%)',
        stock: 'Stock',
        threshold: 'Reorder threshold',
        barcode: 'Barcode',
        images: 'Images',
        variants: 'Variants',
        deleteConfirm: 'Are you sure you want to delete this product?'
      },
      sales: {
        title: 'Sales Management',
        pos: 'Point of Sale',
        newSale: 'New sale',
        cart: 'Cart',
        customer: 'Customer',
        addToCart: 'Add to cart',
        removeFromCart: 'Remove from cart',
        payment: 'Payment',
        cash: 'Cash',
        card: 'Card',
        mobileMoney: 'Mobile Money',
        change: 'Change',
        receipt: 'Receipt',
        printReceipt: 'Print receipt',
        completeSale: 'Complete sale',
        saleCompleted: 'Sale completed successfully'
      },
      inventory: {
        title: 'Inventory Management',
        movements: 'Stock movements',
        transfers: 'Transfers',
        adjustments: 'Adjustments',
        stockCount: 'Physical inventory',
        newTransfer: 'New transfer',
        sourceWarehouse: 'Source warehouse',
        destinationWarehouse: 'Destination warehouse',
        transferItems: 'Items to transfer',
        currentStock: 'Current stock',
        countedStock: 'Counted stock',
        difference: 'Difference'
      },
      settings: {
        title: 'Settings',
        company: 'Company',
        users: 'Users',
        roles: 'Roles',
        taxes: 'Taxes',
        numbering: 'Numbering',
        warehouses: 'Warehouses',
        general: 'General',
        companyName: 'Company name',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        taxNumber: 'Tax number',
        currency: 'Currency',
        language: 'Language',
        theme: 'Theme',
        darkMode: 'Dark mode',
        lightMode: 'Light mode'
      },
      messages: {
        saveSuccess: 'Save successful',
        saveError: 'Save error',
        deleteSuccess: 'Delete successful',
        deleteError: 'Delete error',
        loadError: 'Load error',
        networkError: 'Network error',
        validationError: 'Validation error',
        accessDenied: 'Access denied',
        sessionExpired: 'Session expired'
      }
    };
  }
}