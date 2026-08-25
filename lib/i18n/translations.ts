import type { Locale } from "./config";

export interface TranslationSet {
  navigation: {
    workspace: string;
    overview: string;
    dashboard: string;
    sales: string;
    customers: string;
    inventory: string;
    purchasing: string;
    purchases: string;
    suppliers: string;
    finance: string;
    expenses: string;
    payments: string;
    money: string;
    accounting: string;
    menu: string;
    insights: string;
    reports: string;
    settings: string;
  };

  common: {
    add: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    search: string;
    viewDetails: string;
    loading: string;
    yes: string;
    no: string;
    businessOperatingSystem: string;
    adminUser: string;
    administrator: string;
    yourBusiness: string;
  };

  dashboard: {
    title: string;
    businessPerformance: string;
    revenue: string;
    expenses: string;
    profit: string;
    cashPosition: string;
    receivables: string;
    payables: string;
    inventory: string;
    businessAlerts: string;
    attentionRequired: string;
    salesToday: string;
    inventoryValue: string;
    currentStockValue: string;
    supplierObligationsRequireAttention: string;
    noOutstandingSupplierObligations: string;
    reviewUpcomingSupplierPayments: string;
    recordedSupplierObligationsClear: string;
    reviewExpenses: string;
    reviewAndManageBusinessSpending: string;
    tradingActivityRecorded: string;
    noCompletedSalesToday: string;
    stockAvailable: string;
    noAvailableStock: string;
    shortcuts: string;
    runTheBusiness: string;
    commonOperationalTasks: string;
    activity: string;
    recentActivity: string;
    latestMovement: string;
    live: string;
    activityFeedWaiting: string;
    activityFeedDescription: string;
    operations: string;
    restaurantWorkspace: string;
    businessWorkspace: string;
    restaurantToolsReady: string;
    businessToolsReady: string;
    completedRecords: string;
    stockBalances: string;
    awaitingAction: string;
    manageDishesPricing: string;
    revenueHealth: string;
    profitHealth: string;
    inventoryHealth: string;
    active: string;
    healthy: string;
    stable: string;
    review: string;
    attention: string;
    salesStatus: string;
    inventoryStatus: string;
    purchasing: string;
    purchasesInProgress: string;
    noPurchasesAwaitingAction: string;
    recordSale: string;
    openInventory: string;
    oneWorkspaceForWork: string;
    restaurantConnectedDescription: string;
    businessConnectedDescription: string;
    stockoutRisk: string;
    lowStockRequiresAttention: string;
    inventoryLevelsHealthy: string;
    noAvailableStockItems: string;
    atOrBelowReserved: string;
    noImmediateInventoryShortage: string;
    pendingPurchases: string;
    customerBalancesRequireReview: string;
    noOutstandingReceivables: string;
    supplierObligationsRequireReview: string;
    noOutstandingPayables: string;
    nothingRequiresAttention: string;
    areasNeedAttention: string;
    recommendation: string;
    allClear: string;
    highAttention: string;
    reviewRecommended: string;
    critical: string;
    clear: string;
    reviewStatus: string;
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    today: string;
    sale: string;
    sales: string;
    purchase: string;
    stock: string;
    menu: string;
    expense: string;
    salesTransaction: string;
    supplierPurchase: string;
    inventoryMovement: string;
    recordSaleDescription: string;
    manageMenu: string;
    manageMenuDescription: string;
    receiveStock: string;
    receiveStockDescription: string;
    recordExpense: string;
    recordExpenseDescription: string;
    recordPurchase: string;
    recordPurchaseDescription: string;
    restaurantAtAGlance: string;
    businessAtAGlance: string;
    followUpOutstandingCustomerPayments: string;
    recordedCustomerBalancesClear: string;
  };

  customers: {
    title: string;
    breadcrumb: string;
    description: string;
    addCustomer: string;
    customersOnRecord: string;
    currentlyActive: string;
    withSales: string;
    customersWithRecordedSales: string;
    customerRecords: string;
    viewCustomersAndDetails: string;
    customer: string;
    customers: string;
    contact: string;
    creditLimit: string;
    status: string;
    action: string;
    active: string;
    inactive: string;
    noCustomersYet: string;
    createFirstCustomer: string;
    customerDetails: string;
    newCustomer: string;
    editCustomer: string;
    createCustomerRecord: string;
    updateCustomerInformation: string;
	customerInformation: string;
    basicInformation: string;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    customerAddress: string;
    taxNumberPlaceholder: string;
	taxNumber: string;
    creditSettings: string;
    optionalCreditInformation: string;
    currency: string;
    selectCurrency: string;
    customerStatus: string;
    inactiveCustomerDescription: string;
    createCustomer: string;
	invalidCreditLimit: string;
    unexpectedError: string;
    emailPlaceholder: string;
    creditLimitPlaceholder: string;
  };
  
  sales: {
  title: string;
  description: string;
  completed: string;
  recordSale: string;

  transactions: string;
  salesOnRecord: string;
  completedTransactions: string;
  pending: string;
  stillInProgress: string;
  itemsSold: string;
  lineItemsAcrossSales: string;

  revenue: string;
  salesValue: string;
  salesValueDescription: string;
  noRevenueRecorded: string;
  completedSalesWillAppearHere: string;

  activity: string;
  salesHealth: string;

  salesRegister: string;
  recentSales: string;
  reviewTransactions: string;
  recordAnotherSale: string;

  sale: string;
  items: string;
  item: string;
  value: string;
  status: string;
  action: string;
  saleTransaction: string;
  viewSale: string;
  cancelled: string;
  noSalesYet: string;
  recordFirstSaleDescription: string;
  recordFirstSale: string;
  newSaleBreadcrumb: string;
  newSaleDescription: string;
  salesInventoryConnection: string;
  salesInventoryDescription: string;
  openInventory: string;
};

saleForm: {
  saleDetails: string;
  referenceNumber: string;
  currency: string;
  warehouse: string;
  selectWarehouse: string;
  notes: string;
  saleItems: string;
  selectProducts: string;
  addItem: string;
  menuItemProduct: string;
  product: string;
  selectItem: string;
  restaurantMenu: string;
  inventoryProducts: string;
  quantity: string;
  total: string;
  remove: string;
  saleTotal: string;
  saving: string;
  referenceRequired: string;
  currencyRequired: string;
  warehouseRequired: string;
  itemRequired: string;
  productRequired: string;
  quantityRequired: string;
  createSaleError: string;
  breadcrumb: string;
recordSaleTitle: string;
recordSaleDescription:
  string;
};

saleDetail: {
  backToSales: string;
  breadcrumb: string;
  completeSale: string;
  item: string;
  items: string;
  saleItems: string;
  sku: string;
  quantity: string;
  each: string;
  summary: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  payments: string;
  paymentsReceived: string;
  paid: string;
  outstanding: string;
  noPaymentsRecorded: string;
  paymentsWillAppearHere: string;
  notes: string;
};

recordPayment: {
  title: string;
  description: string;
  paymentReference: string;
  paymentMethod: string;

  cash: string;
  bankTransfer: string;
  card: string;
  mobileMoney: string;
  cheque: string;

  amount: string;
  outstanding: string;
  notes: string;
  optional: string;

  referenceRequired: string;
  methodRequired: string;
  amountRequired: string;
  amountExceedsOutstanding: string;
  recordError: string;

  recording: string;
  record: string;
};

  setup: {
    title: string;
    businessName: string;
    businessType: string;
    country: string;
    city: string;
    currency: string;
    continue: string;
  };
}

export const translations: Record<Locale, TranslationSet> = {
  en: {
    navigation: {
      workspace: "Workspace",
      overview: "Overview",
      dashboard: "Overview",
      sales: "Sales",
      customers: "Customers",
      inventory: "Inventory",
      purchasing: "Purchasing",
      purchases: "Purchases",
      suppliers: "Suppliers",
      finance: "Finance",
      expenses: "Expenses",
      payments: "Payments",
      money: "Money",
      accounting: "Accounting",
      menu: "Menu",
      insights: "Insights",
      reports: "Reports",
      settings: "Settings",
    },
    common: {
      add: "Add",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      search: "Search",
      viewDetails: "View details",
      loading: "Loading",
      yes: "Yes",
      no: "No",
      businessOperatingSystem: "Business operating system",
      adminUser: "Admin User",
      administrator: "Administrator",
      yourBusiness: "Your Business",
    },
    dashboard: {
      businessPerformance: "Business performance",
      goodMorning: "Good morning",
      goodAfternoon: "Good afternoon",
      goodEvening: "Good evening",
      today: "today",
      sale: "sale",
      sales: "sales",
      purchase: "purchase",
      stock: "stock",
      menu: "Menu",
      expense: "Expense",
      salesTransaction: "Sales transaction",
      supplierPurchase: "Supplier purchase",
      inventoryMovement: "Inventory movement",
      recordSaleDescription: "Record a sale and update your business activity.",
      manageMenu: "Manage Menu",
      manageMenuDescription: "Manage dishes and pricing.",
      receiveStock: "Receive Stock",
      receiveStockDescription: "Receive stock and update available inventory.",
      recordExpense: "Record Expense",
      recordExpenseDescription: "Record money spent by the business.",
      recordPurchase: "Record Purchase",
      recordPurchaseDescription: "Record a supplier purchase and update obligations.",
      restaurantAtAGlance: "Your restaurant at a glance. Monitor today's trading activity, stock and purchasing from one workspace.",
      businessAtAGlance: "Your business at a glance. Monitor daily activity, stock and purchasing from one workspace.",
      followUpOutstandingCustomerPayments: "Follow up on outstanding customer payments to improve cash availability.",
      recordedCustomerBalancesClear: "Your recorded customer balances are currently clear.",
      title: "Dashboard",
      revenue: "Revenue",
      expenses: "Expenses",
      profit: "Profit",
      cashPosition: "Cash Position",
      receivables: "Receivables",
      payables: "Payables",
      inventory: "Inventory",
      businessAlerts: "Business alerts",
      attentionRequired: "Attention Required",
      salesToday: "Sales Today",
      inventoryValue: "Inventory Value",
      currentStockValue: "Current Stock Value",
      supplierObligationsRequireAttention: "Supplier obligations require attention",
      noOutstandingSupplierObligations: "No outstanding supplier obligations",
      reviewUpcomingSupplierPayments: "Review upcoming supplier payments and protect your cash position.",
      recordedSupplierObligationsClear: "Your recorded supplier obligations are currently clear.",
      reviewExpenses: "Review Expenses",
      reviewAndManageBusinessSpending: "Review and manage business spending",
      tradingActivityRecorded: "Trading activity recorded",
      noCompletedSalesToday: "No completed sales today",
      stockAvailable: "Stock Available",
      noAvailableStock: "No Available Stock",
      shortcuts: "Shortcuts",
      runTheBusiness: "Run the Business",
      commonOperationalTasks: "Get the most common operational tasks done quickly.",
      activity: "Activity",
      recentActivity: "Recent Activity",
      latestMovement: "The latest movement across your operation.",
      live: "Live",
      activityFeedWaiting: "Your activity feed is waiting",
      activityFeedDescription: "Sales, purchases and inventory movements will appear here as you operate the business.",
      operations: "Operations",
      restaurantWorkspace: "Restaurant Workspace",
      businessWorkspace: "Business Workspace",
      restaurantToolsReady: "Your core restaurant tools are connected and ready for daily operations.",
      businessToolsReady: "Your core business tools are connected and ready for daily operations.",
      completedRecords: "completed records",
      stockBalances: "stock balances",
      awaitingAction: "awaiting action",
      manageDishesPricing: "Manage dishes and pricing",
      revenueHealth: "Revenue Health",
      profitHealth: "Profit Health",
      inventoryHealth: "Inventory Health",
      active: "Active",
      healthy: "Healthy",
      stable: "Stable",
      review: "Review",
      attention: "Attention",
      salesStatus: "Sales Status",
      inventoryStatus: "Inventory Status",
      purchasing: "Purchasing",
      purchasesInProgress: "purchases in progress",
      noPurchasesAwaitingAction: "No purchases awaiting action",
      recordSale: "Record Sale",
      openInventory: "Open Inventory",
      oneWorkspaceForWork: "One workspace for the work that matters.",
      restaurantConnectedDescription: "Your sales, menu, inventory and purchasing tools are connected in one place so you spend less time managing systems and more time running your restaurant.",
      businessConnectedDescription: "Your sales, inventory, purchasing and expenses are connected in one place so you spend less time managing systems and more time running your business.",
      stockoutRisk: "Stockout Risk",
      lowStockRequiresAttention: "Low stock requires attention",
      inventoryLevelsHealthy: "Inventory levels are healthy",
      noAvailableStockItems: "currently have no available stock.",
      atOrBelowReserved: "are at or below their reserved quantity.",
      noImmediateInventoryShortage: "No immediate inventory shortage is detected.",
      pendingPurchases: "No pending purchases",
      customerBalancesRequireReview: "Customer balances require review",
      noOutstandingReceivables: "No outstanding receivables",
      supplierObligationsRequireReview: "Supplier obligations require review",
      noOutstandingPayables: "No outstanding payables",
      nothingRequiresAttention: "Nothing currently requires your attention.",
      areasNeedAttention: "areas may require your attention.",
      recommendation: "Recommendation",
      allClear: "All Clear",
      highAttention: "High Attention",
      reviewRecommended: "Review Recommended",
      critical: "Critical",
      clear: "Clear",
      reviewStatus: "REVIEW",
    },
    customers: {
      customerInformation: "Customer information",
      basicInformation: "Basic information for this customer.",
      customerName: "Customer name",
      phone: "Phone",
      email: "Email",
      address: "Address",
      customerAddress: "Customer address",
      taxNumber: "Tax number",
      taxNumberPlaceholder: "Tax / PIN number",
      creditSettings: "Credit settings",
      optionalCreditInformation: "Optional credit information for customers who purchase on account.",
      creditLimit: "Credit limit",
      currency: "Currency",
      selectCurrency: "Select currency",
      customerStatus: "Customer status",
      inactiveCustomerDescription: "Inactive customers remain in your records but can be excluded from active operations.",
      active: "Active",
      createCustomer: "Create customer",
      title: "Customers",
      breadcrumb: "Business / Customers",
      description: "Manage your customers and keep their sales history connected to your business.",
      addCustomer: "Add customer",
      customersOnRecord: "Customers on record",
      currentlyActive: "Currently active",
      withSales: "With sales",
      customersWithRecordedSales: "Customers with recorded sales",
      customerRecords: "Customer records",
      viewCustomersAndDetails: "View customers and open their account details.",
      customer: "Customer",
      customers: "Customers",
      contact: "Contact",
      
      status: "Status",
      action: "Action",
     
      inactive: "Inactive",
      noCustomersYet: "No customers yet",
      createFirstCustomer: "Create your first customer record so future sales can be connected to the right customer.",
      customerDetails: "Customer details",
      newCustomer: "Customers / New",
      editCustomer: "Customers / Edit",
      createCustomerRecord: "Create a customer record and keep future sales connected to them.",
      updateCustomerInformation: "Update this customer's information and account settings.",
      invalidCreditLimit: "Credit limit must be a valid number.",
      unexpectedError: "Something went wrong. Please try again.",
      emailPlaceholder: "customer@example.com",
      creditLimitPlaceholder: "0.00",
    
	},
	
	sales: {
  title: "Sales",
  description:
    "Record transactions, monitor revenue and keep your sales activity organised.",
  completed: "completed",
  recordSale: "Record a sale",

  transactions: "Transactions",
  salesOnRecord: "Sales on record",
  completedTransactions: "Completed transactions",
  pending: "Pending",
  stillInProgress: "Still in progress",
  itemsSold: "Items sold",
  lineItemsAcrossSales: "Line items across sales",
  cancelled: "Cancelled",
  revenue: "Revenue",
  salesValue: "Sales value",
  salesValueDescription:
    "Sales value currently recorded, excluding cancelled transactions.",
  noRevenueRecorded: "No revenue recorded yet",
  completedSalesWillAppearHere:
    "Completed sales will appear here.",

  activity: "Activity",
  salesHealth: "Sales health",
  newSaleBreadcrumb: "Business / Sales",
  newSaleDescription: "Add products and record a new sale.",
  salesRegister: "Sales register",
  recentSales: "Recent sales",
  reviewTransactions:
    "Review transactions and open individual sale records.",
  recordAnotherSale: "Record another sale",

  sale: "Sale",
  items: "Items",
  item: "item",
  value: "Value",
  status: "Status",
  action: "Action",
  saleTransaction: "Sale transaction",
  viewSale: "View sale",

  noSalesYet: "No sales yet",
  recordFirstSaleDescription:
    "Record your first sale to start tracking revenue and transactions.",
  recordFirstSale: "Record your first sale",

  salesInventoryConnection:
    "Sales are part of your inventory workflow",
  salesInventoryDescription:
    "Product sales represent the outbound side of your stock operations.",
  openInventory: "Open inventory",
},

saleForm: {
  saleDetails: "Sale details",
  referenceNumber: "Reference number",
  currency: "Currency",
  warehouse: "Warehouse",
  selectWarehouse: "Select warehouse",
  notes: "Notes",
  saleItems: "Sale items",
  selectProducts: "Select products and quantities.",
  addItem: "Add item",
  menuItemProduct: "Menu item / Product",
  product: "Product",
  selectItem: "Select item",
  restaurantMenu: "Restaurant menu",
  inventoryProducts: "Inventory products",
  quantity: "Quantity",
  total: "Total",
  remove: "Remove",
  saleTotal: "Sale total",
  saving: "Saving...",
  referenceRequired: "Please enter a sale reference.",
  currencyRequired: "Please select a currency.",
  warehouseRequired: "Please select a warehouse.",
  itemRequired: "Add at least one sale item.",
  productRequired: "Please select a product for every line.",
  quantityRequired:
    "Sale quantities must be greater than zero.",
  createSaleError: "Unable to create sale.",
  breadcrumb: "Business / Sales",
recordSaleTitle: "Record a sale",
recordSaleDescription:
  "Add products and record a new sale.",
},

saleDetail: {
  backToSales: "← Sales",
  breadcrumb: "Business / Sale",
  completeSale: "Complete sale",
  item: "item",
  items: "items",
  saleItems: "Sale items",
  sku: "SKU",
  quantity: "Quantity",
  each: "each",
  summary: "Summary",
  subtotal: "Subtotal",
  discount: "Discount",
  tax: "Tax",
  total: "Total",
  payments: "Payments",
  paymentsReceived: "Payments received against this sale.",
  paid: "Paid",
  outstanding: "Outstanding",
  noPaymentsRecorded: "No payments recorded",
  paymentsWillAppearHere:
    "Payments received for this sale will appear here.",
  notes: "Notes",
},

recordPayment: {
  title: "Record payment",
  description:
    "Record a payment received against this sale.",
  paymentReference: "Payment reference",
  paymentMethod: "Payment method",

  cash: "Cash",
  bankTransfer: "Bank Transfer",
  card: "Card",
  mobileMoney: "Mobile Money",
  cheque: "Cheque",

  amount: "Amount",
  outstanding: "Outstanding",
  notes: "Notes",
  optional: "Optional",

  referenceRequired:
    "Payment reference is required.",
  methodRequired:
    "Payment method is required.",
  amountRequired:
    "Payment amount must be greater than zero.",
  amountExceedsOutstanding:
    "Payment amount exceeds the outstanding balance.",
  recordError:
    "Failed to record payment.",

  recording: "Recording...",
  record: "Record payment",
},



    setup: {
      title: "Set up your business",
      businessName: "Business name",
      businessType: "Business type",
      country: "Country",
      city: "City",
      currency: "Currency",
      continue: "Continue",
    },
  },

  fr: {
    navigation: {
      workspace: "Espace de travail",
      overview: "Vue d'ensemble",
      dashboard: "Vue d'ensemble",
      sales: "Ventes",
      customers: "Clients",
      inventory: "Stock",
      purchasing: "Achats",
      purchases: "Achats",
      suppliers: "Fournisseurs",
      finance: "Finance",
      expenses: "Dépenses",
      payments: "Paiements",
      money: "Trésorerie",
      accounting: "Comptabilité",
      menu: "Menu",
      insights: "Analyses",
      reports: "Rapports",
      settings: "Paramètres",
    },
    common: {
      add: "Ajouter",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      delete: "Supprimer",
      search: "Rechercher",
      viewDetails: "Voir les détails",
      loading: "Chargement",
      yes: "Oui",
      no: "Non",
      businessOperatingSystem: "Système d'exploitation de l'entreprise",
      adminUser: "Administrateur",
      administrator: "Administrateur",
      yourBusiness: "Votre entreprise",
    },
    dashboard: {
      businessPerformance: "Performance de l’entreprise",
      goodMorning: "Bonjour",
      goodAfternoon: "Bon après-midi",
      goodEvening: "Bonsoir",
      today: "aujourd'hui",
      sale: "vente",
      sales: "ventes",
      purchase: "achat",
      stock: "stock",
      menu: "Menu",
      expense: "Dépense",
      salesTransaction: "Transaction de vente",
      supplierPurchase: "Achat fournisseur",
      inventoryMovement: "Mouvement de stock",
      recordSaleDescription: "Enregistrez une vente et mettez à jour l'activité de votre entreprise.",
      manageMenu: "Gérer le menu",
      manageMenuDescription: "Gérez les plats et les prix.",
      receiveStock: "Réceptionner le stock",
      receiveStockDescription: "Réceptionnez le stock et mettez à jour l'inventaire disponible.",
      recordExpense: "Enregistrer une dépense",
      recordExpenseDescription: "Enregistrez l'argent dépensé par l'entreprise.",
      recordPurchase: "Enregistrer un achat",
      recordPurchaseDescription: "Enregistrez un achat fournisseur et mettez à jour les obligations.",
      restaurantAtAGlance: "Votre restaurant en un coup d'œil. Suivez l'activité commerciale, le stock et les achats du jour depuis un seul espace de travail.",
      businessAtAGlance: "Votre entreprise en un coup d'œil. Suivez l'activité quotidienne, le stock et les achats depuis un seul espace de travail.",
      followUpOutstandingCustomerPayments: "Faites le suivi des paiements clients en attente pour améliorer la disponibilité de trésorerie.",
      recordedCustomerBalancesClear: "Vos soldes clients enregistrés sont actuellement à jour.",
      title: "Tableau de bord",
      revenue: "Chiffre d'affaires",
      expenses: "Dépenses",
      profit: "Bénéfice",
      cashPosition: "Trésorerie",
      receivables: "Créances",
      payables: "Dettes fournisseurs",
      inventory: "Stock",
      businessAlerts: "Alertes de l'entreprise",
      attentionRequired: "Attention requise",
      salesToday: "Ventes du jour",
      inventoryValue: "Valeur du stock",
      currentStockValue: "Valeur actuelle du stock",
      supplierObligationsRequireAttention: "Les obligations envers les fournisseurs nécessitent une attention",
      noOutstandingSupplierObligations: "Aucune obligation fournisseur en attente",
      reviewUpcomingSupplierPayments: "Examinez les prochains paiements fournisseurs et protégez votre trésorerie.",
      recordedSupplierObligationsClear: "Vos obligations fournisseurs enregistrées sont actuellement à jour.",
      reviewExpenses: "Examiner les dépenses",
      reviewAndManageBusinessSpending: "Examinez et gérez les dépenses de l'entreprise",
      tradingActivityRecorded: "Activité commerciale enregistrée",
      noCompletedSalesToday: "Aucune vente terminée aujourd'hui",
      stockAvailable: "Stock disponible",
      noAvailableStock: "Aucun stock disponible",
      shortcuts: "Raccourcis",
      runTheBusiness: "Gérer l'entreprise",
      commonOperationalTasks: "Effectuez rapidement les tâches opérationnelles les plus courantes.",
      activity: "Activité",
      recentActivity: "Activité récente",
      latestMovement: "Les derniers mouvements de votre activité.",
      live: "En direct",
      activityFeedWaiting: "Votre fil d'activité est en attente",
      activityFeedDescription: "Les ventes, achats et mouvements de stock apparaîtront ici au fur et à mesure de votre activité.",
      operations: "Opérations",
      restaurantWorkspace: "Espace de travail du restaurant",
      businessWorkspace: "Espace de travail de l'entreprise",
      restaurantToolsReady: "Vos principaux outils de restaurant sont connectés et prêts pour les opérations quotidiennes.",
      businessToolsReady: "Vos principaux outils sont connectés et prêts pour les opérations quotidiennes.",
      completedRecords: "enregistrements terminés",
      stockBalances: "soldes de stock",
      awaitingAction: "en attente d'action",
      manageDishesPricing: "Gérer les plats et les prix",
      revenueHealth: "Santé du chiffre d'affaires",
      profitHealth: "Santé du bénéfice",
      inventoryHealth: "Santé du stock",
      active: "Actif",
      healthy: "Sain",
      stable: "Stable",
      review: "À examiner",
      attention: "Attention",
      salesStatus: "État des ventes",
      inventoryStatus: "État du stock",
      purchasing: "Achats",
      purchasesInProgress: "achats en cours",
      noPurchasesAwaitingAction: "Aucun achat en attente d'action",
      recordSale: "Enregistrer une vente",
      openInventory: "Ouvrir le stock",
      oneWorkspaceForWork: "Un espace de travail pour ce qui compte.",
      restaurantConnectedDescription: "Les ventes, le menu, le stock et les achats sont connectés au même endroit afin que vous passiez moins de temps à gérer des systèmes et plus de temps à gérer votre restaurant.",
      businessConnectedDescription: "Les ventes, le stock, les achats et les dépenses sont connectés au même endroit afin que vous passiez moins de temps à gérer des systèmes et plus de temps à gérer votre entreprise.",
      stockoutRisk: "Risque de rupture de stock",
      lowStockRequiresAttention: "Le stock faible nécessite une attention",
      inventoryLevelsHealthy: "Les niveaux de stock sont sains",
      noAvailableStockItems: "n'ont actuellement aucun stock disponible.",
      atOrBelowReserved: "sont au niveau ou en dessous de leur quantité réservée.",
      noImmediateInventoryShortage: "Aucune pénurie immédiate de stock n'est détectée.",
      pendingPurchases: "Aucun achat en attente",
      customerBalancesRequireReview: "Les soldes clients nécessitent un examen",
      noOutstandingReceivables: "Aucune créance en attente",
      supplierObligationsRequireReview: "Les obligations fournisseurs nécessitent un examen",
      noOutstandingPayables: "Aucune dette fournisseur en attente",
      nothingRequiresAttention: "Rien ne nécessite actuellement votre attention.",
      areasNeedAttention: "domaines peuvent nécessiter votre attention.",
      recommendation: "Recommandation",
      allClear: "Tout est en ordre",
      highAttention: "Attention élevée",
      reviewRecommended: "Examen recommandé",
      critical: "Critique",
      clear: "OK",
      reviewStatus: "À EXAMINER",
    },
    customers: {
      customerInformation: "Informations client",
      basicInformation: "Informations de base sur ce client.",
      customerName: "Nom du client",
      phone: "Téléphone",
      email: "E-mail",
      address: "Adresse",
      customerAddress: "Adresse du client",
      taxNumber: "Numéro fiscal",
      taxNumberPlaceholder: "Numéro fiscal / PIN",
      creditSettings: "Paramètres de crédit",
      optionalCreditInformation: "Informations de crédit facultatives pour les clients qui achètent à crédit.",
      creditLimit: "Limite de crédit",
      currency: "Devise",
      selectCurrency: "Sélectionner une devise",
      customerStatus: "Statut du client",
      inactiveCustomerDescription: "Les clients inactifs restent dans vos registres mais peuvent être exclus des opérations actives.",
      active: "Actif",
      createCustomer: "Créer le client",
      title: "Clients",
      breadcrumb: "Entreprise / Clients",
      description: "Gérez vos clients et conservez leur historique de ventes connecté à votre entreprise.",
      addCustomer: "Ajouter un client",
      customersOnRecord: "Clients enregistrés",
      currentlyActive: "Actuellement actifs",
      withSales: "Avec ventes",
      customersWithRecordedSales: "Clients avec des ventes enregistrées",
      customerRecords: "Fiches clients",
      viewCustomersAndDetails: "Consultez les clients et ouvrez les détails de leur compte.",
      customer: "Client",
      customers: "Clients",
      contact: "Contact",
      
      status: "Statut",
      action: "Action",
      
      inactive: "Inactif",
      noCustomersYet: "Aucun client pour le moment",
      createFirstCustomer: "Créez votre première fiche client afin que les futures ventes puissent être associées au bon client.",
      customerDetails: "Détails du client",
      newCustomer: "Clients / Nouveau",
      editCustomer: "Clients / Modifier",
      createCustomerRecord: "Créez une fiche client et associez-y les futures ventes.",
      updateCustomerInformation: "Mettez à jour les informations et les paramètres du compte de ce client.",
      invalidCreditLimit: "La limite de crédit doit être un nombre valide.",
      unexpectedError: "Une erreur s'est produite. Veuillez réessayer.",
      emailPlaceholder: "client@exemple.com",
      creditLimitPlaceholder: "0,00",
      
	
	},
	
	sales: {
  title: "Ventes",
  description:
    "Enregistrez les transactions, suivez le chiffre d'affaires et gérez votre activité commerciale.",
  completed: "terminées",
  recordSale: "Enregistrer une vente",

  transactions: "Transactions",
  salesOnRecord: "Ventes enregistrées",
  completedTransactions: "Transactions terminées",
  pending: "En attente",
  stillInProgress: "Toujours en cours",
  itemsSold: "Articles vendus",
  lineItemsAcrossSales: "Lignes d'articles dans les ventes",
  cancelled: "Annulées",
  revenue: "Chiffre d'affaires",
  salesValue: "Valeur des ventes",
  salesValueDescription:
    "Valeur des ventes actuellement enregistrée, hors transactions annulées.",
  noRevenueRecorded: "Aucun chiffre d'affaires enregistré",
  completedSalesWillAppearHere:
    "Les ventes terminées apparaîtront ici.",

  activity: "Activité",
  salesHealth: "État des ventes",
  newSaleBreadcrumb: "Entreprise / Ventes",
  newSaleDescription: "Ajoutez des produits et enregistrez une nouvelle vente.",
  salesRegister: "Registre des ventes",
  recentSales: "Ventes récentes",
  reviewTransactions:
    "Consultez les transactions et ouvrez les fiches de vente individuelles.",
  recordAnotherSale: "Enregistrer une autre vente",

  sale: "Vente",
  items: "Articles",
  item: "article",
  value: "Valeur",
  status: "Statut",
  action: "Action",
  saleTransaction: "Transaction de vente",
  viewSale: "Voir la vente",

  noSalesYet: "Aucune vente pour le moment",
  recordFirstSaleDescription:
    "Enregistrez votre première vente pour commencer à suivre le chiffre d'affaires et les transactions.",
  recordFirstSale: "Enregistrer votre première vente",

  salesInventoryConnection:
    "Les ventes font partie de votre flux de gestion du stock",
  salesInventoryDescription:
    "Les ventes de produits représentent la sortie de votre stock.",
  openInventory: "Ouvrir le stock",
},

saleForm: {
  saleDetails: "Détails de la vente",
  referenceNumber: "Numéro de référence",
  currency: "Devise",
  warehouse: "Entrepôt",
  selectWarehouse: "Sélectionner un entrepôt",
  notes: "Notes",
  saleItems: "Articles de la vente",
  selectProducts: "Sélectionnez les produits et les quantités.",
  addItem: "Ajouter un article",
  menuItemProduct: "Article du menu / Produit",
  product: "Produit",
  selectItem: "Sélectionner un article",
  restaurantMenu: "Menu du restaurant",
  inventoryProducts: "Produits en stock",
  quantity: "Quantité",
  total: "Total",
  remove: "Supprimer",
  saleTotal: "Total de la vente",
  saving: "Enregistrement...",
  referenceRequired: "Veuillez saisir une référence de vente.",
  currencyRequired: "Veuillez sélectionner une devise.",
  warehouseRequired: "Veuillez sélectionner un entrepôt.",
  itemRequired: "Ajoutez au moins un article à la vente.",
  productRequired:
    "Veuillez sélectionner un produit pour chaque ligne.",
  quantityRequired:
    "Les quantités vendues doivent être supérieures à zéro.",
  createSaleError: "Impossible de créer la vente.",
  breadcrumb: "Entreprise / Ventes",
recordSaleTitle: "Enregistrer une vente",
recordSaleDescription:
  "Ajoutez des produits et enregistrez une nouvelle vente.",
},

saleDetail: {
  backToSales: "← Ventes",
  breadcrumb: "Entreprise / Vente",
  completeSale: "Terminer la vente",
  item: "article",
  items: "articles",
  saleItems: "Articles de la vente",
  sku: "SKU",
  quantity: "Quantité",
  each: "unité",
  summary: "Résumé",
  subtotal: "Sous-total",
  discount: "Remise",
  tax: "Taxe",
  total: "Total",
  payments: "Paiements",
  paymentsReceived: "Paiements reçus pour cette vente.",
  paid: "Payé",
  outstanding: "Solde restant",
  noPaymentsRecorded: "Aucun paiement enregistré",
  paymentsWillAppearHere:
    "Les paiements reçus pour cette vente apparaîtront ici.",
  notes: "Notes",
},

recordPayment: {
  title: "Enregistrer un paiement",
  description:
    "Enregistrez un paiement reçu pour cette vente.",
  paymentReference: "Référence du paiement",
  paymentMethod: "Mode de paiement",

  cash: "Espèces",
  bankTransfer: "Virement bancaire",
  card: "Carte",
  mobileMoney: "Paiement mobile",
  cheque: "Chèque",

  amount: "Montant",
  outstanding: "Solde restant",
  notes: "Notes",
  optional: "Facultatif",

  referenceRequired:
    "La référence du paiement est obligatoire.",
  methodRequired:
    "Le mode de paiement est obligatoire.",
  amountRequired:
    "Le montant du paiement doit être supérieur à zéro.",
  amountExceedsOutstanding:
    "Le montant du paiement dépasse le solde restant.",
  recordError:
    "Impossible d'enregistrer le paiement.",

  recording: "Enregistrement...",
  record: "Enregistrer le paiement",
},

    setup: {
      title: "Configurez votre entreprise",
      businessName: "Nom de l'entreprise",
      businessType: "Type d'entreprise",
      country: "Pays",
      city: "Ville",
      currency: "Devise",
      continue: "Continuer",
    },
  },

  am: {
    navigation: {
      workspace: "የስራ ቦታ",
      overview: "አጠቃላይ እይታ",
      dashboard: "አጠቃላይ እይታ",
      sales: "ሽያጭ",
      customers: "ደንበኞች",
      inventory: "እቃ ክምችት",
      purchasing: "ግዢ",
      purchases: "ግዢዎች",
      suppliers: "አቅራቢዎች",
      finance: "ፋይናንስ",
      expenses: "ወጪዎች",
      payments: "ክፍያዎች",
      money: "ገንዘብ",
      accounting: "የሂሳብ አያያዝ",
      menu: "ምናሌ",
      insights: "ትንታኔ",
      reports: "ሪፖርቶች",
      settings: "ቅንብሮች",
    },
    common: {
      add: "አክል",
      save: "አስቀምጥ",
      cancel: "ሰርዝ",
      edit: "አርትዕ",
      delete: "ሰርዝ",
      search: "ፈልግ",
      viewDetails: "ዝርዝሮችን ይመልከቱ",
      loading: "በመጫን ላይ",
      yes: "አዎ",
      no: "አይ",
      businessOperatingSystem: "የንግድ አሠራር ስርዓት",
      adminUser: "የአስተዳዳሪ ተጠቃሚ",
      administrator: "አስተዳዳሪ",
      yourBusiness: "የእርስዎ ንግድ",
    },
    dashboard: {
      businessPerformance: "የንግድ አፈጻጸም",
      goodMorning: "እንደምን አደሩ",
      goodAfternoon: "እንደምን አሉ",
      goodEvening: "እንደምን አመሹ",
      today: "ዛሬ",
      sale: "ሽያጭ",
      sales: "ሽያጮች",
      purchase: "ግዢ",
      stock: "እቃ",
      menu: "ምናሌ",
      expense: "ወጪ",
      salesTransaction: "የሽያጭ ግብይት",
      supplierPurchase: "የአቅራቢ ግዢ",
      inventoryMovement: "የእቃ ክምችት እንቅስቃሴ",
      recordSaleDescription: "ሽያጭ ይመዝግቡ እና የንግድ እንቅስቃሴዎን ያዘምኑ።",
      manageMenu: "ምናሌን ያስተዳድሩ",
      manageMenuDescription: "ምግቦችን እና ዋጋዎችን ያስተዳድሩ።",
      receiveStock: "እቃ ይቀበሉ",
      receiveStockDescription: "እቃ ይቀበሉ እና የሚገኘውን እቃ ክምችት ያዘምኑ።",
      recordExpense: "ወጪ ይመዝግቡ",
      recordExpenseDescription: "በንግዱ የተወጣውን ገንዘብ ይመዝግቡ።",
      recordPurchase: "ግዢ ይመዝግቡ",
      recordPurchaseDescription: "የአቅራቢ ግዢን ይመዝግቡ እና የክፍያ ግዴታዎችን ያዘምኑ።",
      restaurantAtAGlance: "ሬስቶራንትዎን በአንድ እይታ ይመልከቱ። የዛሬን የንግድ እንቅስቃሴ፣ እቃ ክምችት እና ግዢ ከአንድ የሥራ ቦታ ይከታተሉ።",
      businessAtAGlance: "ንግድዎን በአንድ እይታ ይመልከቱ። ዕለታዊ እንቅስቃሴን፣ እቃ ክምችትን እና ግዢን ከአንድ የሥራ ቦታ ይከታተሉ።",
      followUpOutstandingCustomerPayments: "የገንዘብ አቅርቦትን ለማሻሻል ያልተከፈሉ የደንበኞች ክፍያዎችን ይከታተሉ።",
      recordedCustomerBalancesClear: "የተመዘገቡ የደንበኞች ሂሳብ ሚዛኖች በአሁኑ ጊዜ ጥሩ ናቸው።",
      title: "ዳሽቦርድ",
      revenue: "ገቢ",
      expenses: "ወጪዎች",
      profit: "ትርፍ",
      cashPosition: "የገንዘብ ሁኔታ",
      receivables: "የሚሰበሰብ ገንዘብ",
      payables: "የሚከፈል ገንዘብ",
      inventory: "የእቃ ክምችት",
      businessAlerts: "የንግድ ማስጠንቀቂያዎች",
      attentionRequired: "ትኩረት ያስፈልጋል",
      salesToday: "የዛሬ ሽያጭ",
      inventoryValue: "የእቃ ክምችት ዋጋ",
      currentStockValue: "የአሁኑ የእቃ ክምችት ዋጋ",
      supplierObligationsRequireAttention: "ለአቅራቢዎች ያሉ የክፍያ ግዴታዎች ትኩረት ይፈልጋሉ",
      noOutstandingSupplierObligations: "ምንም ያልተከፈለ የአቅራቢ ግዴታ የለም",
      reviewUpcomingSupplierPayments: "የሚመጡ የአቅራቢዎች ክፍያዎችን ይመልከቱ እና የገንዘብ ሁኔታዎን ይጠብቁ።",
      recordedSupplierObligationsClear: "የተመዘገቡ የአቅራቢ ክፍያ ግዴታዎች በአሁኑ ጊዜ ችግር የላቸውም።",
      reviewExpenses: "ወጪዎችን ይመልከቱ",
      reviewAndManageBusinessSpending: "የንግድ ወጪዎችን ይመልከቱ እና ያስተዳድሩ",
      tradingActivityRecorded: "የንግድ እንቅስቃሴ ተመዝግቧል",
      noCompletedSalesToday: "ዛሬ የተጠናቀቀ ሽያጭ የለም",
      stockAvailable: "የሚገኝ እቃ",
      noAvailableStock: "የሚገኝ እቃ የለም",
      shortcuts: "አቋራጮች",
      runTheBusiness: "ንግዱን ያስተዳድሩ",
      commonOperationalTasks: "በጣም የሚያስፈልጉ የንግድ ሥራዎችን በፍጥነት ያከናውኑ።",
      activity: "እንቅስቃሴ",
      recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
      latestMovement: "በንግድዎ ውስጥ የተከሰቱ የቅርብ ጊዜ እንቅስቃሴዎች።",
      live: "በቀጥታ",
      activityFeedWaiting: "የእንቅስቃሴ መረጃዎ በመጠባበቅ ላይ ነው",
      activityFeedDescription: "ንግዱን ሲያካሂዱ ሽያጮች፣ ግዢዎች እና የእቃ ክምችት እንቅስቃሴዎች እዚህ ይታያሉ።",
      operations: "ሥራዎች",
      restaurantWorkspace: "የሬስቶራንት የሥራ ቦታ",
      businessWorkspace: "የንግድ የሥራ ቦታ",
      restaurantToolsReady: "የሬስቶራንትዎ ዋና መሣሪያዎች ተገናኝተው ለዕለታዊ ሥራ ዝግጁ ናቸው።",
      businessToolsReady: "የንግድዎ ዋና መሣሪያዎች ተገናኝተው ለዕለታዊ ሥራ ዝግጁ ናቸው።",
      completedRecords: "የተጠናቀቁ መዝገቦች",
      stockBalances: "የእቃ ክምችት ሚዛኖች",
      awaitingAction: "እርምጃ በመጠባበቅ ላይ",
      manageDishesPricing: "ምግቦችን እና ዋጋዎችን ያስተዳድሩ",
      revenueHealth: "የገቢ ሁኔታ",
      profitHealth: "የትርፍ ሁኔታ",
      inventoryHealth: "የእቃ ክምችት ሁኔታ",
      active: "ንቁ",
      healthy: "ጤናማ",
      stable: "የተረጋጋ",
      review: "ይመርምሩ",
      attention: "ትኩረት",
      salesStatus: "የሽያጭ ሁኔታ",
      inventoryStatus: "የእቃ ክምችት ሁኔታ",
      purchasing: "ግዢ",
      purchasesInProgress: "ግዢዎች በሂደት ላይ",
      noPurchasesAwaitingAction: "እርምጃ የሚጠብቅ ግዢ የለም",
      recordSale: "ሽያጭ ይመዝግቡ",
      openInventory: "የእቃ ክምችትን ይክፈቱ",
      oneWorkspaceForWork: "ለአስፈላጊው ሥራ አንድ የሥራ ቦታ።",
      restaurantConnectedDescription: "ሽያጭ፣ ምናሌ፣ የእቃ ክምችት እና ግዢ በአንድ ቦታ ተገናኝተዋል፤ ስለዚህ ስርዓቶችን ለማስተዳደር የሚያጠፉትን ጊዜ ቀንሰው ሬስቶራንትዎን ለማስተዳደር ብዙ ጊዜ ማዋል ይችላሉ።",
      businessConnectedDescription: "ሽያጭ፣ የእቃ ክምችት፣ ግዢ እና ወጪዎች በአንድ ቦታ ተገናኝተዋል፤ ስለዚህ ስርዓቶችን ለማስተዳደር የሚያጠፉትን ጊዜ ቀንሰው ንግድዎን ለማስተዳደር ብዙ ጊዜ ማዋል ይችላሉ።",
      stockoutRisk: "የእቃ እጥረት አደጋ",
      lowStockRequiresAttention: "ዝቅተኛ የእቃ ክምችት ትኩረት ይፈልጋል",
      inventoryLevelsHealthy: "የእቃ ክምችት ደረጃዎች ጥሩ ናቸው",
      noAvailableStockItems: "በአሁኑ ጊዜ የሚገኝ እቃ የላቸውም።",
      atOrBelowReserved: "ከተያዘው የእቃ መጠን ጋር እኩል ወይም ከዚያ በታች ናቸው።",
      noImmediateInventoryShortage: "በአሁኑ ጊዜ አስቸኳይ የእቃ እጥረት አልተገኘም።",
      pendingPurchases: "በመጠባበቅ ላይ ያሉ ግዢዎች የሉም",
      customerBalancesRequireReview: "የደንበኞች ሂሳብ ሚዛኖች መመርመር ያስፈልጋቸዋል",
      noOutstandingReceivables: "ምንም ያልተሰበሰበ ገንዘብ የለም",
      supplierObligationsRequireReview: "የአቅራቢዎች የክፍያ ግዴታዎች መመርመር ያስፈልጋቸዋል",
      noOutstandingPayables: "ምንም ያልተከፈለ ገንዘብ የለም",
      nothingRequiresAttention: "በአሁኑ ጊዜ ትኩረትዎን የሚፈልግ ነገር የለም።",
      areasNeedAttention: "አንዳንድ የንግድ ክፍሎች ትኩረትዎን ሊፈልጉ ይችላሉ።",
      recommendation: "ምክር",
      allClear: "ሁሉም ነገር ጥሩ ነው",
      highAttention: "ከፍተኛ ትኩረት",
      reviewRecommended: "መመርመር ይመከራል",
      critical: "አስፈላጊ",
      clear: "ጥሩ",
      reviewStatus: "ይመርምሩ",
    },
    customers: {
      customerInformation: "የደንበኛ መረጃ",
      basicInformation: "ስለዚህ ደንበኛ መሰረታዊ መረጃ።",
      customerName: "የደንበኛ ስም",
      phone: "ስልክ",
      email: "ኢሜይል",
      address: "አድራሻ",
      customerAddress: "የደንበኛ አድራሻ",
      taxNumber: "የግብር ቁጥር",
      taxNumberPlaceholder: "የግብር / PIN ቁጥር",
      creditSettings: "የብድር ቅንብሮች",
      optionalCreditInformation: "በክሬዲት ለሚገዙ ደንበኞች አማራጭ የብድር መረጃ።",
      creditLimit: "የብድር ገደብ",
      currency: "ምንዛሬ",
      selectCurrency: "ምንዛሬ ይምረጡ",
      customerStatus: "የደንበኛ ሁኔታ",
      inactiveCustomerDescription: "ንቁ ያልሆኑ ደንበኞች በመዝገብዎ ውስጥ ይቆያሉ ነገር ግን ከንቁ ሥራዎች ሊገለሉ ይችላሉ።",
      active: "ንቁ",
      createCustomer: "ደንበኛ ይፍጠሩ",
      title: "ደንበኞች",
      breadcrumb: "ንግድ / ደንበኞች",
      description: "ደንበኞችዎን ያስተዳድሩ እና የሽያጭ ታሪካቸውን ከንግድዎ ጋር ያገናኙ።",
      addCustomer: "ደንበኛ ያክሉ",
      customersOnRecord: "በመዝገብ ላይ ያሉ ደንበኞች",
      currentlyActive: "በአሁኑ ጊዜ ንቁ",
      withSales: "ሽያጭ ያላቸው",
      customersWithRecordedSales: "የተመዘገቡ ሽያጮች ያላቸው ደንበኞች",
      customerRecords: "የደንበኞች መዝገቦች",
      viewCustomersAndDetails: "ደንበኞችን ይመልከቱ እና የመለያቸውን ዝርዝር ይክፈቱ።",
      customer: "ደንበኛ",
      customers: "ደንበኞች",
      contact: "የመገኛ መረጃ",
     
      status: "ሁኔታ",
      action: "እርምጃ",
     
      inactive: "ንቁ ያልሆነ",
      noCustomersYet: "እስካሁን ደንበኞች የሉም",
      createFirstCustomer: "የመጀመሪያውን የደንበኛ መዝገብ ይፍጠሩ፣ ስለዚህ የወደፊት ሽያጮች ከትክክለኛው ደንበኛ ጋር ሊገናኙ ይችላሉ።",
      customerDetails: "የደንበኛ ዝርዝሮች",
      newCustomer: "ደንበኞች / አዲስ",
      editCustomer: "ደንበኞች / አርትዕ",
      createCustomerRecord: "የደንበኛ መዝገብ ይፍጠሩ እና የወደፊት ሽያጮችን ከእሱ ጋር ያገናኙ።",
      updateCustomerInformation: "የዚህን ደንበኛ መረጃ እና የመለያ ቅንብሮች ያዘምኑ።",
      invalidCreditLimit: "የክሬዲት ገደቡ ትክክለኛ ቁጥር መሆን አለበት።",
      unexpectedError: "አንድ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
      emailPlaceholder: "customer@example.com",
      creditLimitPlaceholder: "0.00",
      
	
	},
	
	sales: {
  title: "ሽያጭ",
  description:
    "ግብይቶችን ይመዝግቡ፣ ገቢን ይከታተሉ እና የሽያጭ እንቅስቃሴዎን ያደራጁ።",
  completed: "የተጠናቀቁ",
  recordSale: "ሽያጭ ይመዝግቡ",

  transactions: "ግብይቶች",
  salesOnRecord: "በመዝገብ ላይ ያሉ ሽያጮች",
  completedTransactions: "የተጠናቀቁ ግብይቶች",
  pending: "በመጠባበቅ ላይ",
  stillInProgress: "አሁንም በሂደት ላይ",
  itemsSold: "የተሸጡ እቃዎች",
  lineItemsAcrossSales: "በሽያጮች ውስጥ ያሉ የእቃ መስመሮች",
  cancelled: "የተሰረዙ",
  revenue: "ገቢ",
  salesValue: "የሽያጭ ዋጋ",
  salesValueDescription:
    "የተሰረዙ ግብይቶችን ሳይጨምር በአሁኑ ጊዜ የተመዘገበ የሽያጭ ዋጋ።",
  noRevenueRecorded: "እስካሁን ገቢ አልተመዘገበም",
  completedSalesWillAppearHere:
    "የተጠናቀቁ ሽያጮች እዚህ ይታያሉ።",

  activity: "እንቅስቃሴ",
  salesHealth: "የሽያጭ ሁኔታ",
  newSaleBreadcrumb: "ንግድ / ሽያጭ",
  newSaleDescription: "ምርቶችን ያክሉ እና አዲስ ሽያጭ ይመዝግቡ።",
  salesRegister: "የሽያጭ መዝገብ",
  recentSales: "የቅርብ ጊዜ ሽያጮች",
  reviewTransactions:
    "ግብይቶችን ይመልከቱ እና የግል የሽያጭ መዝገቦችን ይክፈቱ።",
  recordAnotherSale: "ሌላ ሽያጭ ይመዝግቡ",

  sale: "ሽያጭ",
  items: "እቃዎች",
  item: "እቃ",
  value: "ዋጋ",
  status: "ሁኔታ",
  action: "እርምጃ",
  saleTransaction: "የሽያጭ ግብይት",
  viewSale: "ሽያጩን ይመልከቱ",

  noSalesYet: "እስካሁን ሽያጭ የለም",
  recordFirstSaleDescription:
    "ገቢን እና ግብይቶችን መከታተል ለመጀመር የመጀመሪያውን ሽያጭ ይመዝግቡ።",
  recordFirstSale: "የመጀመሪያውን ሽያጭ ይመዝግቡ",

  salesInventoryConnection:
    "ሽያጭ የእቃ ክምችት አስተዳደርዎ አካል ነው",
  salesInventoryDescription:
    "የምርት ሽያጮች ከእቃ ክምችትዎ የሚወጣውን እቃ ያመለክታሉ።",
  openInventory: "የእቃ ክምችትን ይክፈቱ",
},

saleForm: {
  saleDetails: "የሽያጭ ዝርዝሮች",
  referenceNumber: "የማጣቀሻ ቁጥር",
  currency: "ምንዛሬ",
  warehouse: "መጋዘን",
  selectWarehouse: "መጋዘን ይምረጡ",
  notes: "ማስታወሻዎች",
  saleItems: "የሽያጭ እቃዎች",
  selectProducts: "ምርቶችን እና መጠኖችን ይምረጡ።",
  addItem: "እቃ ያክሉ",
  menuItemProduct: "የምናሌ እቃ / ምርት",
  product: "ምርት",
  selectItem: "እቃ ይምረጡ",
  restaurantMenu: "የሬስቶራንት ምናሌ",
  inventoryProducts: "የእቃ ክምችት ምርቶች",
  quantity: "መጠን",
  total: "ጠቅላላ",
  remove: "አስወግድ",
  saleTotal: "የሽያጭ ጠቅላላ",
  saving: "በማስቀመጥ ላይ...",
  referenceRequired: "እባክዎ የሽያጭ ማጣቀሻ ያስገቡ።",
  currencyRequired: "እባክዎ ምንዛሬ ይምረጡ።",
  warehouseRequired: "እባክዎ መጋዘን ይምረጡ።",
  itemRequired: "ቢያንስ አንድ የሽያጭ እቃ ያክሉ።",
  productRequired:
    "እባክዎ ለእያንዳንዱ መስመር ምርት ይምረጡ።",
  quantityRequired:
    "የሽያጭ መጠኖች ከዜሮ በላይ መሆን አለባቸው።",
  createSaleError: "ሽያጩን መፍጠር አልተቻለም።",
  breadcrumb: "ንግድ / ሽያጮች",
recordSaleTitle: "ሽያጭ ይመዝግቡ",
recordSaleDescription:
  "ምርቶችን ያክሉ እና አዲስ ሽያጭ ይመዝግቡ።",
},

saleDetail: {
  backToSales: "← ሽያጮች",
  breadcrumb: "ንግድ / ሽያጭ",
  completeSale: "ሽያጩን ያጠናቅቁ",
  item: "እቃ",
  items: "እቃዎች",
  saleItems: "የሽያጭ እቃዎች",
  sku: "SKU",
  quantity: "መጠን",
  each: "እያንዳንዱ",
  summary: "ማጠቃለያ",
  subtotal: "ንዑስ ድምር",
  discount: "ቅናሽ",
  tax: "ግብር",
  total: "ጠቅላላ",
  payments: "ክፍያዎች",
  paymentsReceived: "ለዚህ ሽያጭ የተቀበሉ ክፍያዎች።",
  paid: "የተከፈለ",
  outstanding: "ያልተከፈለ ቀሪ",
  noPaymentsRecorded: "ምንም ክፍያ አልተመዘገበም",
  paymentsWillAppearHere:
    "ለዚህ ሽያጭ የተቀበሉ ክፍያዎች እዚህ ይታያሉ።",
  notes: "ማስታወሻዎች",
},

recordPayment: {
  title: "ክፍያ ይመዝግቡ",
  description:
    "ለዚህ ሽያጭ የተቀበሉትን ክፍያ ይመዝግቡ።",
  paymentReference: "የክፍያ ማጣቀሻ",
  paymentMethod: "የክፍያ ዘዴ",

  cash: "ጥሬ ገንዘብ",
  bankTransfer: "የባንክ ማስተላለፍ",
  card: "ካርድ",
  mobileMoney: "የሞባይል ገንዘብ",
  cheque: "ቼክ",

  amount: "መጠን",
  outstanding: "ያልተከፈለ ቀሪ",
  notes: "ማስታወሻዎች",
  optional: "አማራጭ",

  referenceRequired:
    "የክፍያ ማጣቀሻ ያስፈልጋል።",
  methodRequired:
    "የክፍያ ዘዴ ያስፈልጋል።",
  amountRequired:
    "የክፍያ መጠን ከዜሮ በላይ መሆን አለበት።",
  amountExceedsOutstanding:
    "የክፍያ መጠኑ ከቀሪው ያልተከፈለ መጠን ይበልጣል።",
  recordError:
    "ክፍያውን መመዝገብ አልተቻለም።",

  recording: "በመመዝገብ ላይ...",
  record: "ክፍያ ይመዝግቡ",
},

    setup: {
      title: "ንግድዎን ያዘጋጁ",
      businessName: "የንግድ ስም",
      businessType: "የንግድ አይነት",
      country: "ሀገር",
      city: "ከተማ",
      currency: "ምንዛሬ",
      continue: "ቀጥል",
    },
  },
};