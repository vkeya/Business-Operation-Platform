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
	services: string;
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
  tax: string;

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

inventory: {
	title: string;
	selectSourceWarehouseRequired: string;
selectDestinationWarehouseRequired: string;
warehousesMustBeDifferent: string;
transferQuantityPositive: string;
stockTransferredSuccessfully: string;
transferStockError: string;
fromWarehouse: string;
selectSourceWarehouse: string;
toWarehouse: string;
selectDestinationWarehouse: string;
enterQuantity: string;
optionalTransferNotes: string;
transferring: string;

	stockLevelsHealthy: string;
	products: string;
	unitsInStock: string;
	lowStock: string;
	stockValue: string;
	quickActions: string;
	receiveStock: string;
	receiveStockDescription: string;
	adjustStock: string;
	adjustStockDescription: string;
	transferStock: string;
	transferStockDescription: string;
	currentStockLevels: string;
	stockAlerts: string;
	noStockRecordsYet: string;
	outOfStock: string;
	lowStockStatus: string;
	manageProducts: string;
	stockMovements: string;
	warehouses: string;
	viewInventory: string;
	itemsActivelyTracked: string;
    acrossActiveStockBalances: string;
    belowConfiguredThreshold: string;
    basedOnAverageStockCost: string;
    operations: string;
    commonTasks: string;

    inbound: string;
    correction: string;
    movement: string;
    liveStock: string;
    viewHistory: string;
    latestStockBalances: string;
    receiveFirstStock: string;
    attention: string;
    itemsNeedReplenishment: string;
    stockLevelsLookHealthy: string;
    noProductsBelowThreshold: string;
    currentQuantity: string;
    threshold: string;
    viewAllProducts: string;
    activity: string;
    reviewStockMovements: string;
    openCatalogue: string;
    productsAndServices: string;
    viewMovements: string;
    activeInventoryLocations: string;
	createProductOrService: string;
    itemsNeedAttention: string;
    heroDescription: string;
	adjustStockPageDescription: string;

warehouse: string;
selectProduct: string;
selectWarehouse: string;
adjustmentQuantity: string;
adjustmentQuantityPlaceholder: string;
adjustmentQuantityHelp: string;

adjustmentReason: string;
adjustmentReasonPlaceholder: string;
selectProductRequired: string;
selectWarehouseRequired: string;
adjustmentQuantityZero: string;
selectedProductNotFound: string;
adjustmentReasonRequired: string;
stockAdjustedBy: string;
forProduct: string;
adjustStockError: string;
adjusting: string;
movementHistory: string;
movementHistoryDescription: string;
all: string;
allProducts: string;
allWarehouses: string;
from: string;
to: string;
applyDates: string;
noInventoryMovements: string;
inventoryMovementsEmptyDescription: string;
date: string;

quantity: string;
unitCost: string;
totalCost: string;
notes: string;
productCatalogue: string;
productCatalogueDescription: string;
catalogue: string;
productCatalogueLabel: string;
manageProductsAndServices: string;
addProduct: string;
productSummary: string;
active: string;
currentlyAvailable: string;
stockTracked: string;
productsConnectedToInventory: string;
inactive: string;
notCurrentlyAvailable: string;
yourProducts: string;
searchReviewEditProducts: string;
addAnotherProduct: string;
productCatalogueEmpty: string;
addFirstProductDescription: string;
addYourFirstProduct: string;
keepCatalogueAccurate: string;
catalogueOperationsDescription: string;
openInventory: string;
productIdRequired: string;
editProduct: string;
optionalReceiptNotes: string;
receiving: string;


selectCurrency: string;

noProductsFound: string;
productSearchEmptyDescription: string;

stock: string;
status: string;
action: string;
tracked: string;
notTracked: string;
edit: string;
searchProducts: string;
searching: string;
addProductDescription: string;
basicInformation: string;
productName: string;
barcode: string;
optional: string;
type: string;
product: string;
service: string;
unit: string;
description: string;
optionalDescription: string;
pricing: string;
costPrice: string;
sellingPrice: string;
currency: string;
stockSettings: string;
trackStock: string;
trackStockDescription: string;
minimumStock: string;
reorderLevel: string;
saving: string;
saveProduct: string;
saveProductError: string;
backToInventory: string;
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

  expenses: {
    title: string;
    finance: string;
    description: string;
    recordExpense: string;

    totalExpenses: string;
    expense: string;
    expenses: string;
    onRecord: string;

    paid: string;
    fullyPaid: string;
    partial: string;
    partiallyPaid: string;
    outstanding: string;
    unpaid: string;

    spendingOverview: string;
    whereMoneyIsGoing: string;
    largestExpenseCategories: string;
    noSpendingCategories: string;
    spendingCategoriesWillAppearHere: string;

    paymentHealth: string;
    expenseObligations: string;
    seeHowExpensesAreSettling: string;

    expenseRegister: string;
    businessSpending: string;
    reviewRecordedExpenses: string;
    recordAnotherExpense: string;

    category: string;
    descriptionLabel: string;
    date: string;
    amount: string;
    payment: string;
    action: string;
    created: string;
    viewDetails: string;

    noExpensesYet: string;
    recordFirstExpenseDescription: string;
    recordFirstExpense: string;

    financeConnectionTitle: string;
    financeConnectionDescription: string;
    backToDashboard: string;

    newExpense: string;
    newExpenseDescription: string;
    cancel: string;
    saving: string;

    reference: string;
    referencePlaceholder: string;
    categoryPlaceholder: string;
    descriptionPlaceholder: string;
    amountPlaceholder: string;
    expenseDate: string;
    paymentStatus: string;
    notes: string;
    notesPlaceholder: string;

    unpaidStatus: string;
    partiallyPaidStatus: string;
    paidStatus: string;

    recordExpenseError: string;

    backToExpenses: string;
    expenseDetails: string;
    currency: string;
    createdDate: string;

    updatePaymentStatus: string;
    updatePaymentStatusDescription: string;
    updatingPaymentStatus: string;
    unableToUpdatePaymentStatus: string;
    record: string;

  };

  suppliers: {
  title: string;
  breadcrumb: string;
  description: string;
  addSupplier: string;
  activeSupplier: string;
  activeSuppliers: string;
  supplier: string;
  suppliersOnRecord: string;
  availableForPurchasing: string;
  contactable: string;
  suppliersWithEmail: string;
  paymentTerms: string;
  suppliersWithCreditTerms: string;
  supplierManagement: string;
  yourSupplierNetwork: string;
  supplierNetworkDescription: string;
  activeSuppliersTitle: string;
  readyForPurchasing: string;
  activeSuppliersDescription: string;
  paymentTermsTitle: string;
  supplierCreditInformation: string;
  paymentTermsDescription: string;
  contactDetails: string;
  keepSupplierInformationCurrent: string;
  contactDetailsDescription: string;
  supplierRegister: string;
  supplierDirectory: string;
  supplierDirectoryDescription: string;
  addAnotherSupplier: string;
  noSuppliersYet: string;
  addFirstSupplierDescription: string;
  addFirstSupplier: string;
  tax: string;
  contact: string;
  currency: string;
  creditTerms: string;
  immediate: string;
  days: string;
  status: string;
  action: string;
  active: string;
  inactive: string;
  purchasingConnection: string;
  purchasingConnectionDescription: string;
  openPurchases: string;
  noPhone: string;
  noEmail: string;
  addSupplierDescription: string;
supplierInformation: string;
supplierName: string;
supplierNamePlaceholder: string;
phone: string;
email: string;
optional: string;
address: string;
optionalSupplierAddress: string;
taxNumber: string;
selectCurrency: string;
saving: string;
saveSupplier: string;
unableToSaveSupplier: string;
};

  setup: {
    title: string;
    businessName: string;
    businessType: string;
    country: string;
    city: string;
    currency: string;
    continue: string;
	businessInformation: string;
businessInformationDescription: string;
businessNamePlaceholder: string;
businessTypeDescription: string;
regionalSettings: string;
regionalSettingsDescription: string;
baseCurrency: string;
firstLocation: string;
firstLocationDescription: string;
branchName: string;
mainBranchPlaceholder: string;
branchCode: string;
inventoryLocation: string;
mainWarehousePlaceholder: string;
locationCode: string;
setupSummary: string;
business: string;
type: string;

branch: string;
notProvided: string;
setupReady: string;
checkInformation: string;
unableToSaveSetup: string;
restaurant: string;
restaurantDescription: string;
bar: string;
barDescription: string;
hotel: string;
hotelDescription: string;
hospitalClinic: string;
hospitalClinicDescription: string;
supermarket: string;
supermarketDescription: string;
shop: string;
shopDescription: string;
boutique: string;
boutiqueDescription: string;
otherBusiness: string;
otherBusinessDescription: string;
heading: string;
description: string;
language: string;
timezone: string;

  };

restaurantDashboard: {
  restaurantOverviewBreadcrumb: string;
  title: string;
  description: string;
  restaurantOverview: string;
  salesToday: string;
  foodCost: string;
  ingredientCostToday: string;
  grossProfit: string;
  salesLessFoodCostToday: string;
  grossMargin: string;
  grossProfitPercentage: string;
  restaurantActivityMetrics: string;
  averageSale: string;
  averageCompletedSaleToday: string;
  completedSales: string;
  completedSalesRecordedToday: string;
  todaysSalesBreakdown: string;
  menuItemSalesFromCompletedTransactions: string;
  noMenuItemSalesToday: string;
  completedRestaurantSalesWillAppearHere: string;
  menuItem: string;
  quantity: string;
  revenue: string;
  quickActions: string;
  quickActionsDescription: string;
  open: string;
  restaurantPerformance: string;
  todaysOperatingPerformance: string;
  sales: string;
  topSellingMenuItems: string;
  bestSellingRestaurantItemsToday: string;
  recentSales: string;
  latestCompletedRestaurantSales: string;
  noCompletedSalesToday: string;
  completedSalesWillAppearHere: string;
  lowStockIngredients: string;
  ingredientsNeedReplenishment: string;
  noActiveWarehouse: string;
  addActiveWarehouse: string;
  noLowStockIngredients: string;
  ingredientBalancesAboveThreshold: string;
  replenish: string;
  menuProfitability: string;
  menuItemsRankedByGrossProfit: string;
  noMenuProfitabilityData: string;
  addRecipesForProfitability: string;
  sellingPrice: string;
  margin: string;
  recordSale: string;
  recordSaleDescription: string;
  manageMenus: string;
  manageMenusDescription: string;
  manageInventory: string;
  manageInventoryDescription: string;
  addStock: string;
  addStockDescription: string;
  sale: string;
  recordedToday: string;
  sold: string;
  item: string;
  items: string;
};

restaurantMenu: {
  title: string;
  breadcrumb: string;
  description: string;
  createMenu: string;
  noMenusYet: string;
  createFirstMenuDescription: string;
  createFirstMenu: string;
  yourMenus: string;
  menu: string;
  menus: string;

  noDescription: string;
  menuItems: string;
  menuInformation: string;
  menuName: string;
  menuNamePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  cancel: string;
  creating: string;
  unableToCreateMenu: string;
  createMenuPageDescription: string;
  backToMenus: string;
  restaurantMenuBreadcrumb: string;
  addMenuItem: string;

  noMenuItemsYet: string;
  addMenuItemsDescription: string;
  addFirstMenuItem: string;

  item: string;
  items: string;
  inThisMenu: string;

  costingWarehouse: string;
  warehouseRequiredForCosting: string;
  addActiveWarehouseForProfitability: string;
  createMenuError: string;
  recipeCost: string;
  grossProfit: string;
  grossMargin: string;
  noRecipeCostingAvailable: string;
  addRecipeIngredientsForProfitability: string;
  createMenuItemError: string;
menuItemInformation: string;

standaloneMenuItem: string;
inventoryProductDescription: string;
itemName: string;
itemNamePlaceholder: string;
optionalDescription: string;

availableOnMenu: string;
creatingMenuItem: string;
menuItem: string;
available: string;
unavailable: string;
itemDetails: string;
sellingPrice: string;
availability: string;
availableForSale: string;
currentlyUnavailable: string;
inventoryProduct: string;
sku: string;
operations: string;
recipeAndCosting: string;
recipeAndCostingDescription: string;
manageRecipe: string;
};

services: {
  serviceCatalogueLabel: string;
  title: string;
  description: string;
  addService: string;
  totalServices: string;
  servicesInCatalogue: string;
  activeServices: string;
  currentlyAvailable: string;
  catalogue: string;
  yourServices: string;
  manageServicesDescription: string;
  noServicesYet: string;
  createFirstServiceDescription: string;
  createFirstService: string;
  price: string;
  active: string;
  inactive: string;
  serviceCategories: string;
  categories: string;
  categoriesDescription: string;
  selectCategory: string;
  deactivateCategory: string;
  activateCategory: string;
  categoryStatus: string;
  activeCategories: string;
inactiveCategories: string;
addCategory: string;
categoryName: string;
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
	  services: "services",
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
      tax: "Tax",

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

    inventory: {
      title: "Inventory",
      description: "Manage products, monitor stock levels and keep your inventory under control.",
      selectSourceWarehouseRequired:
  "Please select a source warehouse.",
selectDestinationWarehouseRequired:
  "Please select a destination warehouse.",
warehousesMustBeDifferent:
  "Source and destination warehouses must be different.",
transferQuantityPositive:
  "Transfer quantity must be greater than zero.",
stockTransferredSuccessfully:
  "Successfully transferred",
transferStockError:
  "Failed to transfer stock.",
fromWarehouse:
  "From warehouse",
selectSourceWarehouse:
  "Select source warehouse",
toWarehouse:
  "To warehouse",
selectDestinationWarehouse:
  "Select destination warehouse",
enterQuantity:
  "Enter quantity",
optionalTransferNotes:
  "Optional transfer notes",
transferring:
  "Transferring...",
      stockLevelsHealthy: "Stock levels healthy",
      products: "Products",
      unitsInStock: "Units in stock",
      lowStock: "Low stock",
      stockValue: "Stock value",
      quickActions: "Quick actions",
      receiveStock: "Receive stock",
      receiveStockDescription: "Receive stock and update available quantities.",
      adjustStock: "Adjust stock",
      adjustStockDescription: "Correct stock quantities when needed.",
      transferStock: "Transfer stock",
      transferStockDescription: "Move stock between warehouses.",
      currentStockLevels: "Current stock levels",
      stockAlerts: "Stock alerts",
      noStockRecordsYet: "No stock records yet",
      outOfStock: "Out of stock",
      lowStockStatus: "Low stock",
      manageProducts: "Manage products",
      stockMovements: "Stock movements",
      warehouses: "Warehouses",
      viewInventory: "View inventory",
	  itemsActivelyTracked: "Items actively tracked",
      acrossActiveStockBalances: "Across active stock balances",
      belowConfiguredThreshold: "Below configured threshold",
      basedOnAverageStockCost: "Based on average stock cost",
      operations: "Operations",
      commonTasks: "Common tasks for keeping your inventory accurate.",

      inbound: "Inbound",
      correction: "Correction",
      movement: "Movement",
      liveStock: "Live stock",
      viewHistory: "View history",
      latestStockBalances: "Your latest stock balances by warehouse.",
      receiveFirstStock: "Receive your first stock movement to start building inventory.",
      attention: "Attention",
      itemsNeedReplenishment: "Items that may need replenishment.",
      stockLevelsLookHealthy: "Stock levels look healthy",
      noProductsBelowThreshold: "No products are currently below their configured threshold.",
      currentQuantity: "Current quantity",
      threshold: "Threshold",
      viewAllProducts: "View all products",
      activity: "Activity",
      reviewStockMovements: "Review receipts, transfers and adjustments.",
      openCatalogue: "Open catalogue",
      productsAndServices: "products and services",
      viewMovements: "View movements",
      activeInventoryLocations: "Active inventory locations",
      createProductOrService:
        "Create a product or service.",
      itemsNeedAttention:
        "Items that may need attention.",
      heroDescription:
        "Manage products, monitor stock levels and keep your inventory under control.",
	  adjustStockPageDescription:
  "Correct inventory quantities after a physical stock count or other inventory reconciliation.",
	product: "Product",
  warehouse: "Warehouse",
  selectProduct: "Select a product",
  selectWarehouse: "Select a warehouse",
  adjustmentQuantity: "Adjustment quantity",
  adjustmentQuantityPlaceholder: "e.g. -4 or +5",
  adjustmentQuantityHelp:
    "Use a negative number to reduce stock or a positive number to increase stock.",
  currency: "Currency",
  adjustmentReason: "Reason / notes",
  adjustmentReasonPlaceholder:
    "Explain why the adjustment is being made",
  selectProductRequired:
    "Please select a product.",
  selectWarehouseRequired:
    "Please select a warehouse.",
  adjustmentQuantityZero:
    "Adjustment quantity cannot be zero.",
  selectedProductNotFound:
    "Selected product was not found.",
  adjustmentReasonRequired:
    "Please provide a reason for the adjustment.",
  stockAdjustedBy: "Stock adjusted by",
  forProduct: "for",
  adjustStockError:
    "Failed to adjust stock.",
  adjusting: "Adjusting",
  movementHistory: "Movement History",
movementHistoryDescription:
  "Review receipts, adjustments, and other inventory movements.",
all: "All",
allProducts: "All products",
allWarehouses: "All warehouses",
from: "From",
to: "To",
applyDates: "Apply dates",
noInventoryMovements: "No inventory movements yet",
inventoryMovementsEmptyDescription:
  "Stock receipts and adjustments will appear here.",
date: "Date",
type: "Type",
quantity: "Quantity",
unitCost: "Unit cost",
totalCost: "Total cost",
notes: "Notes",
productCatalogue: "Products",
productCatalogueDescription:
  "Manage the products and services your business sells, including pricing and inventory tracking.",
catalogue: "Catalogue",
productCatalogueLabel: "Product catalogue",
manageProductsAndServices:
  "Manage the products and services your business sells, including pricing and inventory tracking.",
addProduct: "Add product",
productSummary: "Product summary",
active: "Active",
currentlyAvailable: "Currently available",
stockTracked: "Stock tracked",
productsConnectedToInventory:
  "Products connected to inventory",
inactive: "Inactive",
notCurrentlyAvailable: "Not currently available",
yourProducts: "Your products",
searchReviewEditProducts:
  "Search, review and edit the items your business sells.",
addAnotherProduct: "Add another product",
productCatalogueEmpty:
  "Your product catalogue is empty",
addFirstProductDescription:
  "Add your first product or service to start managing pricing, sales and inventory from Teketeke.",
addYourFirstProduct:
  "Add your first product",
keepCatalogueAccurate:
  "Keep your catalogue accurate",
catalogueOperationsDescription:
  "Product pricing and inventory settings flow into your wider business operations.",
openInventory: "Open inventory",
productIdRequired: "Product ID is required for editing.",
editProduct: "Edit product",
optional: "Optional",
service: "Service",
optionalDescription: "Optional description",
selectCurrency: "Select currency",
noProductsFound: "No products found",
productSearchEmptyDescription:
  "Try a different product name, SKU or barcode.",
sellingPrice: "Selling price",
stock: "Stock",
status: "Status",
action: "Action",
tracked: "Tracked",
notTracked: "Not tracked",
edit: "Edit",
searchProducts: "Search products...",
searching: "Searching...",
addProductDescription: "Add a product or service to your business.",
basicInformation: "Basic information",
productName: "Product name",
barcode: "Barcode",
unit: "Unit",
optionalReceiptNotes:
  "Optional receipt notes",
receiving:
  "Receiving...",

pricing: "Pricing",
costPrice: "Cost price",
stockSettings: "Stock settings",
trackStock: "Track stock for this item",
trackStockDescription:
  "Turn this off for services or items that do not need inventory tracking.",
minimumStock: "Minimum stock",
reorderLevel: "Reorder level",
saving: "Saving...",
saveProduct: "Save product",
saveProductError: "Unable to save the product.",
backToInventory: "Back to inventory",
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

    expenses: {
      title: "Expenses",
      finance: "Finance",
      description:
        "Keep control of business spending, payment obligations and operating costs from one place.",
      recordExpense: "Record expense",

      totalExpenses: "Total expenses",
      expense: "expense",
      expenses: "expenses",
      onRecord: "on record",

      paid: "Paid",
      fullyPaid: "fully paid",
      partial: "Partial",
      partiallyPaid: "partially paid",
      outstanding: "Outstanding",
      unpaid: "unpaid",

      spendingOverview: "Spending overview",
      whereMoneyIsGoing: "Where money is going",
      largestExpenseCategories:
        "Your largest expense categories based on recorded spending.",
      noSpendingCategories: "No spending categories yet",
      spendingCategoriesWillAppearHere:
        "Expense categories will appear here as you record spending.",

      paymentHealth: "Payment health",
      expenseObligations: "Expense obligations",
      seeHowExpensesAreSettling:
        "See how your recorded expenses are settling.",

      expenseRegister: "Expense register",
      businessSpending: "Business spending",
      reviewRecordedExpenses:
        "Review recorded expenses and payment obligations.",
      recordAnotherExpense: "Record another expense",

      category: "Category",
      descriptionLabel: "Description",
      date: "Date",
      amount: "Amount",
      payment: "Payment",
      action: "Action",
      created: "Created",
      viewDetails: "View details",

      noExpensesYet: "No expenses yet",
      recordFirstExpenseDescription:
        "Record your first business expense to start tracking operating costs and payment obligations.",
      recordFirstExpense: "Record your first expense",

      financeConnectionTitle:
        "Expenses are part of your financial picture",
      financeConnectionDescription:
        "Keep spending visible alongside sales, purchasing and the rest of your business operations.",
      backToDashboard: "Back to dashboard →",

      newExpense: "Record expense",
      newExpenseDescription:
        "Record a business expense and track its payment status.",
      cancel: "Cancel",
      saving: "Saving...",

      reference: "Reference",
      referencePlaceholder: "e.g. EXP-001",
      categoryPlaceholder:
        "e.g. Rent, Utilities, Transport",
      descriptionPlaceholder:
        "Describe what the business spent money on",
      amountPlaceholder: "0.00",
      expenseDate: "Expense date",
      paymentStatus: "Payment status",
      notes: "Notes",
      notesPlaceholder: "Optional notes",

      unpaidStatus: "Unpaid",
      partiallyPaidStatus: "Partially paid",
      paidStatus: "Paid",

      recordExpenseError: "Unable to record expense.",

      backToExpenses: "← Expenses",
      expenseDetails: "Expense details",
      currency: "Currency",
      createdDate: "Created",
      updatePaymentStatus: "Payment status",
      updatePaymentStatusDescription:
        "Update the payment status as the expense is paid.",
      updatingPaymentStatus: "Updating payment status...",
      unableToUpdatePaymentStatus:
        "Unable to update payment status.",
      record: "Record",

    },

	suppliers: {
  title: "Suppliers",
  breadcrumb: "Purchasing / Suppliers",
  description:
    "Keep your supplier relationships, purchasing terms and contact information organised in one place.",
  addSupplier: "Add supplier",
  activeSupplier: "active supplier",
  activeSuppliers: "Active suppliers",
  supplier: "Supplier",
  suppliersOnRecord: "Suppliers on record",
  availableForPurchasing: "Available for purchasing",
  contactable: "Contactable",
  suppliersWithEmail: "Suppliers with email",
  paymentTerms: "Payment terms",
  suppliersWithCreditTerms: "Suppliers with credit terms",
  supplierManagement: "Supplier management",
  yourSupplierNetwork: "Your supplier network",
  supplierNetworkDescription:
    "Keep purchasing relationships organised and ready for your next order.",
  activeSuppliersTitle: "Active suppliers",
  readyForPurchasing: "Ready for purchasing",
  activeSuppliersDescription:
    "Active suppliers can be used when creating and managing purchases.",
  paymentTermsTitle: "Payment terms",
  supplierCreditInformation: "Supplier credit information",
  paymentTermsDescription:
    "Keep track of suppliers that offer payment terms beyond immediate settlement.",
  contactDetails: "Contact details",
  keepSupplierInformationCurrent:
    "Keep supplier information current",
  contactDetailsDescription:
    "Store supplier phone numbers, email addresses and tax information for easy reference.",
  supplierRegister: "Supplier register",
  supplierDirectory: "Supplier directory",
  supplierDirectoryDescription:
    "Review the businesses you purchase from.",
  addAnotherSupplier: "Add another supplier",
  noSuppliersYet: "No suppliers yet",
  addFirstSupplierDescription:
    "Add your first supplier to start managing purchasing relationships.",
  addFirstSupplier: "Add your first supplier",
  tax: "Tax",
  contact: "Contact",
  currency: "Currency",
  creditTerms: "Credit terms",
  immediate: "Immediate",
  days: "days",
  status: "Status",
  action: "Action",
  active: "Active",
  inactive: "Inactive",
  purchasingConnection:
    "Suppliers connect directly to purchasing",
  purchasingConnectionDescription:
    "Use your supplier directory when creating purchases and managing incoming stock.",
  openPurchases: "Open purchases",
  noPhone: "No phone",
  noEmail: "No email",
  addSupplierDescription: "Add a supplier your business purchases from.",
supplierInformation: "Supplier information",
supplierName: "Supplier name",
supplierNamePlaceholder: "e.g. ABC Distributors",
phone: "Phone",
email: "Email",
optional: "Optional",
address: "Address",
optionalSupplierAddress: "Optional supplier address",
taxNumber: "Tax number",
selectCurrency: "Select currency",
saving: "Saving...",
saveSupplier: "Save supplier",
unableToSaveSupplier: "Unable to save the supplier.",
},



    setup: {
      title: "Set up your business",
      businessName: "Business name",
      businessType: "Business type",
      country: "Country",
      city: "City",
      currency: "Currency",
      continue: "Continue",
	  businessInformation: "Business information",
businessInformationDescription: "Start with the basics about your business.",
businessNamePlaceholder: "e.g. Keya Restaurant",
businessTypeDescription: "This helps us prepare the right tools for your business.",
regionalSettings: "Regional settings",
regionalSettingsDescription: "We'll use your country as a starting point, but you can customize these settings.",
baseCurrency: "Base currency",
firstLocation: "First location",
firstLocationDescription: "Start with one branch and one inventory location. You can add more later.",
branchName: "Branch name",
mainBranchPlaceholder: "Main Branch",
branchCode: "Branch code",
inventoryLocation: "Inventory location",
mainWarehousePlaceholder: "Main Warehouse",
locationCode: "Location code",
setupSummary: "Setup summary",
business: "Business",
type: "Type",

branch: "Branch",
notProvided: "Not provided",
setupReady: "Your business setup is valid and ready to be saved.",
checkInformation: "Please check the highlighted information.",
unableToSaveSetup: "Unable to save your business setup.",
 restaurant: "Restaurant",
restaurantDescription:
  "Manage food, drinks, sales, inventory and purchasing.",

bar: "Bar",
barDescription:
  "Manage drinks, stock, sales, purchasing and cash.",

hotel: "Hotel",
hotelDescription:
  "Manage hotel operations, sales, inventory and services.",

hospitalClinic: "Hospital / Clinic",
hospitalClinicDescription:
  "Manage supplies, medicines, sales, purchasing and operational activity.",

supermarket: "Supermarket",
supermarketDescription:
  "Manage products, barcode sales, inventory, suppliers and customers.",

shop: "Shop",
shopDescription:
  "Manage products, sales, inventory, purchasing and customers.",
boutique: "Boutique / Beauty Services",
boutiqueDescription:
  "Manage boutique products, salon and beauty services, customers, sales and appointments.",
otherBusiness: "Other Business",
otherBusinessDescription:
  "Start with the core business tools and configure more later.",
heading: "Set up your business",
description:
  "Tell us about your business so we can configure the right tools for you.",
language: "Language",
timezone: "Timezone",
 },

restaurantDashboard: {
  restaurantOverviewBreadcrumb: "Restaurant / Overview",
  title: "Restaurant dashboard",
  description: "Monitor your restaurant operations, menus, inventory and sales from one place.",
  restaurantOverview: "Restaurant overview",
  salesToday: "Sales today",
  foodCost: "Food cost",
  ingredientCostToday: "Ingredient cost for completed sales today",
  grossProfit: "Gross profit",
  salesLessFoodCostToday: "Sales less food cost today",
  grossMargin: "Gross margin",
  grossProfitPercentage: "Gross profit as a percentage of sales",
  restaurantActivityMetrics: "Restaurant activity metrics",
  averageSale: "Average sale",
  averageCompletedSaleToday: "Average completed sale today",
  completedSales: "Completed sales",
  completedSalesRecordedToday: "Completed sales recorded today",
  todaysSalesBreakdown: "Today's sales breakdown",
  menuItemSalesFromCompletedTransactions: "Menu item sales from completed transactions today.",
  noMenuItemSalesToday: "No menu item sales today",
  completedRestaurantSalesWillAppearHere: "Completed restaurant sales will appear here.",
  menuItem: "Menu item",
  quantity: "Quantity",
  revenue: "Revenue",
  quickActions: "Quick actions",
  quickActionsDescription: "Get common restaurant tasks done quickly.",
  open: "Open",
  restaurantPerformance: "Restaurant performance",
  todaysOperatingPerformance: "Today's operating performance.",
  sales: "Sales",
  topSellingMenuItems: "Top-selling menu items",
  bestSellingRestaurantItemsToday: "Best-selling restaurant items today.",
  recentSales: "Recent sales",
  latestCompletedRestaurantSales: "Latest completed restaurant sales.",
  noCompletedSalesToday: "No completed sales today",
  completedSalesWillAppearHere: "Completed sales will appear here.",
  lowStockIngredients: "Low-stock ingredients",
  ingredientsNeedReplenishment: "Ingredients that may need replenishment.",
  noActiveWarehouse: "No active warehouse",
  addActiveWarehouse: "Add an active warehouse to monitor ingredient stock.",
  noLowStockIngredients: "No low-stock ingredients",
  ingredientBalancesAboveThreshold: "Current ingredient balances are above the warning threshold.",
  replenish: "Replenish",
  menuProfitability: "Menu profitability",
  menuItemsRankedByGrossProfit: "Menu items ranked by gross profit.",
  noMenuProfitabilityData: "No menu profitability data",
  addRecipesForProfitability: "Add recipes and inventory costs to calculate profitability.",
  sellingPrice: "Selling price",
  margin: "Margin",
  recordSale: "Record a sale",
  recordSaleDescription: "Record a restaurant sale.",
  manageMenus: "Manage menus",
  manageMenusDescription: "Manage dishes, drinks and menu items.",
  manageInventory: "Manage inventory",
  manageInventoryDescription: "View stock and inventory movements.",
  addStock: "Add stock",
  addStockDescription: "Receive ingredients into inventory.",
  sale: "sale",
  recordedToday: "recorded today",
  sold: "sold",
  item: "item",
  items: "items",
},

restaurantMenu: {
  title: "Menus",
  breadcrumb: "Restaurant / Menu",
  description:
    "Manage the menus and customer-facing items offered by your restaurant.",
  createMenu: "Create menu",
  noMenusYet: "No menus yet",
  createFirstMenuDescription:
    "Create your first restaurant menu to start adding dishes, drinks and other customer-facing items.",
  createFirstMenu: "Create your first menu",
  yourMenus: "Your menus",
  menu: "menu",
  menus: "menus",

  noDescription: "No description added.",
  menuItems: "Menu items",
   menuInformation: "Menu information",
  menuName: "Menu name",
  menuNamePlaceholder: "e.g. Main Menu",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Optional description of this menu",
  cancel: "Cancel",
  creating: "Creating...",
  unableToCreateMenu: "Unable to create the menu.",
  createMenuPageDescription:
    "Create a menu for the products and dishes your restaurant offers.",
  backToMenus: "Menus",
  restaurantMenuBreadcrumb: "Restaurant / Menu",
  addMenuItem: "Add menu item",

  noMenuItemsYet: "No menu items yet",
  addMenuItemsDescription:
    "Add dishes, drinks or other items offered on this menu.",
  addFirstMenuItem: "Add your first menu item",

  item: "item",
  items: "items",
  inThisMenu: "in this menu",

  costingWarehouse: "Costing warehouse",
  warehouseRequiredForCosting: "Warehouse required for costing",
  addActiveWarehouseForProfitability:
    "Add an active warehouse to calculate menu item profitability.",

  createMenuError: "Unable to create the menu.",
  unavailable: "Unavailable",

  recipeCost: "Recipe cost",
  grossProfit: "Gross profit",
  grossMargin: "Gross margin",

  noRecipeCostingAvailable: "No recipe costing available",
  addRecipeIngredientsForProfitability:
    "Add a recipe and ingredients to calculate profitability.",
  createMenuItemError:
  "Unable to create the menu item.",
menuItemInformation:
  "Menu item information",
inventoryProduct:
  "Inventory product",
standaloneMenuItem:
  "Standalone menu item",
inventoryProductDescription:
  "Optional. Link this menu item to an existing inventory product.",
itemName:
  "Item name",
itemNamePlaceholder:
  "e.g. Chicken & Chips",
optionalDescription:
  "Optional description",
sellingPrice:
  "Selling price",
availableOnMenu:
  "Available on the menu",
creatingMenuItem:
  "Creating...",
  menuItem: "Menu item",
available: "Available",

itemDetails: "Item details",

availability: "Availability",
availableForSale: "Available for sale",
currentlyUnavailable: "Currently unavailable",

sku: "SKU",
operations: "Operations",
recipeAndCosting: "Recipe & costing",
recipeAndCostingDescription:
  "Manage the recipe used to prepare this menu item, including its ingredients and costing.",
manageRecipe: "Manage recipe",
},

services: {
  serviceCatalogueLabel: "Service Catalogue",
  title: "Services",
  description:
    "Manage the services your Boutique offers, including pricing and availability.",
  addService: "Add Service",
  totalServices: "Total Services",
  servicesInCatalogue: "Services in your catalogue",
  activeServices: "Active Services",
  currentlyAvailable: "Currently available",
  catalogue: "Catalogue",
  yourServices: "Your Services",
  manageServicesDescription:
    "Search, review and manage the services in your catalogue.",
  noServicesYet: "No Services Yet",
  createFirstServiceDescription:
    "Add your first service to start building your Boutique service catalogue.",
  createFirstService: "Create Your First Service",
  price: "Price",
  active: "Active",
  inactive: "Inactive",
  serviceCategories: "Service Categories",
  categories: "Categories",
  categoriesDescription:
    "Organize your Boutique services into clear categories.",
  selectCategory: "Select a category",
  deactivateCategory: "Deactivate category",
  activateCategory: "Activate category",
  categoryStatus: "Category status",
  activeCategories: "Active Categories",
inactiveCategories: "Inactive Categories",
addCategory: "Add Category",
categoryName: "Category Name",
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
	  services: "Services",
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
  tax: "Taxe",

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

 inventory: {
  title: "Stock",
  description:
    "Gérez vos produits, surveillez les niveaux de stock et gardez votre inventaire sous contrôle.",
  selectSourceWarehouseRequired:
  "Veuillez sélectionner un entrepôt source.",
selectDestinationWarehouseRequired:
  "Veuillez sélectionner un entrepôt de destination.",
warehousesMustBeDifferent:
  "Les entrepôts source et de destination doivent être différents.",
transferQuantityPositive:
  "La quantité transférée doit être supérieure à zéro.",
stockTransferredSuccessfully:
  "Transfert réussi de",
transferStockError:
  "Échec du transfert du stock.",
fromWarehouse:
  "Entrepôt source",
selectSourceWarehouse:
  "Sélectionner l’entrepôt source",
toWarehouse:
  "Entrepôt de destination",
selectDestinationWarehouse:
  "Sélectionner l’entrepôt de destination",
enterQuantity:
  "Saisir la quantité",
optionalTransferNotes:
  "Notes de transfert facultatives",
transferring:
  "Transfert en cours...",
  stockLevelsHealthy: "Niveaux de stock sains",
  products: "Produits",
  unitsInStock: "Unités en stock",
  lowStock: "Stock faible",
  stockValue: "Valeur du stock",
  quickActions: "Actions rapides",
  receiveStock: "Réceptionner le stock",
  receiveStockDescription:
    "Réceptionnez le stock et mettez à jour les quantités disponibles.",
  adjustStock: "Ajuster le stock",
  adjustStockDescription:
    "Corrigez les quantités en stock lorsque nécessaire.",
  transferStock: "Transférer le stock",
  transferStockDescription:
    "Déplacez le stock entre les entrepôts.",
  currentStockLevels: "Niveaux de stock actuels",
  stockAlerts: "Alertes de stock",
  noStockRecordsYet:
    "Aucun enregistrement de stock pour le moment",
  outOfStock: "Rupture de stock",
  lowStockStatus: "Stock faible",
  manageProducts: "Gérer les produits",
  stockMovements: "Mouvements de stock",
  warehouses: "Entrepôts",
  viewInventory: "Voir le stock",

  itemsActivelyTracked: "Articles suivis activement",
  acrossActiveStockBalances:
    "Sur l’ensemble des stocks actifs",
  belowConfiguredThreshold:
    "En dessous du seuil configuré",
  basedOnAverageStockCost:
    "Selon le coût moyen du stock",
  operations: "Opérations",
  commonTasks:
    "Tâches courantes pour maintenir votre inventaire à jour.",

  inbound: "Entrée",
  correction: "Correction",
  movement: "Mouvement",
  liveStock: "Stock actuel",
  viewHistory: "Voir l’historique",
  latestStockBalances:
    "Vos derniers soldes de stock par entrepôt.",
  receiveFirstStock:
    "Réceptionnez votre premier mouvement de stock pour commencer à constituer votre inventaire.",
  attention: "Attention",
  itemsNeedReplenishment:
    "Articles pouvant nécessiter un réapprovisionnement.",
  stockLevelsLookHealthy:
    "Les niveaux de stock sont satisfaisants",
  noProductsBelowThreshold:
    "Aucun produit n’est actuellement en dessous de son seuil configuré.",
  currentQuantity: "Quantité actuelle",
  threshold: "Seuil",
  viewAllProducts: "Voir tous les produits",
  activity: "Activité",
  reviewStockMovements:
    "Consultez les réceptions, transferts et ajustements.",
  openCatalogue: "Ouvrir le catalogue",
  productsAndServices: "produits et services",
  viewMovements: "Voir les mouvements",
  activeInventoryLocations:
    "Emplacements de stock actifs",
	createProductOrService:
  "Créez un produit ou un service.",
itemsNeedAttention:
  "Articles pouvant nécessiter une attention particulière.",
heroDescription:
  "Gérez vos produits, surveillez les niveaux de stock et gardez votre inventaire sous contrôle.",
adjustStockPageDescription:
  "Corrigez les quantités d’inventaire après un comptage physique du stock ou une autre opération de rapprochement.",
 product: "Produit",
  warehouse: "Entrepôt",
  selectProduct: "Sélectionnez un produit",
  selectWarehouse: "Sélectionnez un entrepôt",
  adjustmentQuantity: "Quantité d'ajustement",
  adjustmentQuantityPlaceholder: "ex. -4 ou +5",
  adjustmentQuantityHelp:
    "Utilisez un nombre négatif pour réduire le stock ou un nombre positif pour augmenter le stock.",
  currency: "Devise",
  adjustmentReason: "Motif / notes",
  adjustmentReasonPlaceholder:
    "Expliquez pourquoi l'ajustement est effectué",
  selectProductRequired:
    "Veuillez sélectionner un produit.",
  selectWarehouseRequired:
    "Veuillez sélectionner un entrepôt.",
  adjustmentQuantityZero:
    "La quantité d'ajustement ne peut pas être zéro.",
  selectedProductNotFound:
    "Le produit sélectionné est introuvable.",
  adjustmentReasonRequired:
    "Veuillez fournir un motif pour l'ajustement.",
  stockAdjustedBy: "Stock ajusté de",
  forProduct: "pour",
  adjustStockError:
    "Échec de l'ajustement du stock.",
  adjusting: "Ajustement",
  movementHistory: "Historique des mouvements",
movementHistoryDescription:
  "Consultez les réceptions, ajustements et autres mouvements de stock.",
all: "Tous",
allProducts: "Tous les produits",
allWarehouses: "Tous les entrepôts",
from: "De",
to: "À",
applyDates: "Appliquer les dates",
noInventoryMovements:
  "Aucun mouvement de stock pour le moment",
inventoryMovementsEmptyDescription:
  "Les réceptions et ajustements de stock apparaîtront ici.",
date: "Date",
type: "Type",
quantity: "Quantité",
unitCost: "Coût unitaire",
totalCost: "Coût total",
notes: "Notes",
 productCatalogue: "Produits",
productCatalogueDescription:
  "Gérez les produits et services vendus par votre entreprise, notamment les prix et le suivi des stocks.",
catalogue: "Catalogue",
productCatalogueLabel: "Catalogue de produits",
manageProductsAndServices:
  "Gérez les produits et services vendus par votre entreprise, notamment les prix et le suivi des stocks.",
addProduct: "Ajouter un produit",
productSummary: "Résumé des produits",
active: "Actifs",
currentlyAvailable: "Actuellement disponibles",
stockTracked: "Stock suivi",
productsConnectedToInventory:
  "Produits connectés à l'inventaire",
inactive: "Inactifs",
notCurrentlyAvailable: "Actuellement indisponibles",
yourProducts: "Vos produits",
searchReviewEditProducts:
  "Recherchez, consultez et modifiez les articles vendus par votre entreprise.",
addAnotherProduct: "Ajouter un autre produit",
productCatalogueEmpty:
  "Votre catalogue de produits est vide",
addFirstProductDescription:
  "Ajoutez votre premier produit ou service pour commencer à gérer les prix, les ventes et les stocks dans Teketeke.",
addYourFirstProduct:
  "Ajouter votre premier produit",
keepCatalogueAccurate:
  "Gardez votre catalogue à jour",
catalogueOperationsDescription:
  "Les paramètres de prix et de stock des produits alimentent vos opérations commerciales.",
openInventory: "Ouvrir l'inventaire",
productIdRequired:
  "L'identifiant du produit est requis pour la modification.",
editProduct: "Modifier le produit",
optional: "Facultatif",
service: "Service",
optionalDescription: "Description facultative",
selectCurrency: "Sélectionner la devise",
trackStockDescription:
  "Désactivez cette option pour les services ou les articles qui ne nécessitent pas de suivi des stocks.",
noProductsFound: "Aucun produit trouvé",
productSearchEmptyDescription:
  "Essayez un autre nom de produit, SKU ou code-barres.",
sellingPrice: "Prix de vente",
stock: "Stock",
status: "Statut",
action: "Action",
tracked: "Suivi",
notTracked: "Non suivi",
edit: "Modifier",
searchProducts: "Rechercher des produits...",
searching: "Recherche en cours...",
addProductDescription:
  "Ajoutez un produit ou un service à votre entreprise.",
basicInformation: "Informations de base",
productName: "Nom du produit",
barcode: "Code-barres",
unit: "Unité",
pricing: "Tarification",
costPrice: "Prix de revient",
stockSettings: "Paramètres de stock",
trackStock: "Suivre le stock de cet article",
minimumStock: "Stock minimum",
reorderLevel: "Seuil de réapprovisionnement",
saving: "Enregistrement...",
saveProduct: "Enregistrer le produit",
saveProductError:
  "Impossible d'enregistrer le produit.",
  optionalReceiptNotes:
  "Notes de réception facultatives",
receiving:
  "Réception en cours...",
  backToInventory: "Retour à l’inventaire",
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

    expenses: {
      title: "Dépenses",
      finance: "Finance",
      description:
        "Gardez le contrôle des dépenses, des obligations de paiement et des coûts opérationnels de votre entreprise depuis un seul endroit.",
      recordExpense: "Enregistrer une dépense",

      totalExpenses: "Total des dépenses",
      expense: "dépense",
      expenses: "dépenses",
      onRecord: "enregistrée(s)",

      paid: "Payé",
      fullyPaid: "entièrement payé",
      partial: "Partiel",
      partiallyPaid: "partiellement payé",
      outstanding: "En attente",
      unpaid: "impayé",

      spendingOverview: "Aperçu des dépenses",
      whereMoneyIsGoing: "Où va l'argent",
      largestExpenseCategories:
        "Vos principales catégories de dépenses selon les dépenses enregistrées.",
      noSpendingCategories: "Aucune catégorie de dépenses",
      spendingCategoriesWillAppearHere:
        "Les catégories de dépenses apparaîtront ici au fur et à mesure que vous enregistrez vos dépenses.",

      paymentHealth: "État des paiements",
      expenseObligations: "Obligations de dépenses",
      seeHowExpensesAreSettling:
        "Consultez l'état de règlement de vos dépenses enregistrées.",

      expenseRegister: "Registre des dépenses",
      businessSpending: "Dépenses de l'entreprise",
      reviewRecordedExpenses:
        "Consultez les dépenses enregistrées et les obligations de paiement.",
      recordAnotherExpense: "Enregistrer une autre dépense",

      category: "Catégorie",
      descriptionLabel: "Description",
      date: "Date",
      amount: "Montant",
      payment: "Paiement",
      action: "Action",
      created: "Créé",
      viewDetails: "Voir les détails",

      noExpensesYet: "Aucune dépense pour le moment",
      recordFirstExpenseDescription:
        "Enregistrez votre première dépense pour commencer à suivre les coûts opérationnels et les obligations de paiement.",
      recordFirstExpense: "Enregistrer votre première dépense",

      financeConnectionTitle:
        "Les dépenses font partie de votre situation financière",
      financeConnectionDescription:
        "Gardez une visibilité sur vos dépenses aux côtés des ventes, des achats et du reste de vos opérations.",
      backToDashboard: "Retour au tableau de bord →",

      newExpense: "Enregistrer une dépense",
      newExpenseDescription:
        "Enregistrez une dépense d'entreprise et suivez son état de paiement.",
      cancel: "Annuler",
      saving: "Enregistrement...",

      reference: "Référence",
      referencePlaceholder: "ex. DEP-001",
      categoryPlaceholder:
        "ex. Loyer, Services publics, Transport",
      descriptionPlaceholder:
        "Décrivez ce pour quoi l'entreprise a dépensé de l'argent",
      amountPlaceholder: "0,00",
      expenseDate: "Date de la dépense",
      paymentStatus: "État du paiement",
      notes: "Notes",
      notesPlaceholder: "Notes facultatives",

      unpaidStatus: "Impayé",
      partiallyPaidStatus: "Partiellement payé",
      paidStatus: "Payé",

      recordExpenseError:
        "Impossible d'enregistrer la dépense.",

      backToExpenses: "← Dépenses",
      expenseDetails: "Détails de la dépense",
      currency: "Devise",
      createdDate: "Créé",
      updatePaymentStatus: "État du paiement",
      updatePaymentStatusDescription:
        "Mettez à jour l'état du paiement au fur et à mesure que la dépense est réglée.",
      updatingPaymentStatus: "Mise à jour de l'état du paiement...",
      unableToUpdatePaymentStatus:
        "Impossible de mettre à jour l'état du paiement.",
      record: "Enregistrement",
    },

	suppliers: {
  title: "Fournisseurs",
  breadcrumb: "Achats / Fournisseurs",
  description:
    "Gérez vos relations avec les fournisseurs, vos conditions d'achat et leurs coordonnées au même endroit.",
  addSupplier: "Ajouter un fournisseur",
  activeSupplier: "fournisseur actif",
  activeSuppliers: "Fournisseurs actifs",
  supplier: "Fournisseur",
  suppliersOnRecord: "Fournisseurs enregistrés",
  availableForPurchasing: "Disponibles pour les achats",
  contactable: "Joignables",
  suppliersWithEmail: "Fournisseurs avec adresse e-mail",
  paymentTerms: "Conditions de paiement",
  suppliersWithCreditTerms:
    "Fournisseurs avec conditions de crédit",
  supplierManagement: "Gestion des fournisseurs",
  yourSupplierNetwork: "Votre réseau de fournisseurs",
  supplierNetworkDescription:
    "Organisez vos relations d'achat et préparez-les pour votre prochaine commande.",
  activeSuppliersTitle: "Fournisseurs actifs",
  readyForPurchasing: "Prêts pour les achats",
  activeSuppliersDescription:
    "Les fournisseurs actifs peuvent être utilisés lors de la création et de la gestion des achats.",
  paymentTermsTitle: "Conditions de paiement",
  supplierCreditInformation:
    "Informations sur le crédit fournisseur",
  paymentTermsDescription:
    "Suivez les fournisseurs qui proposent des conditions de paiement au-delà d'un règlement immédiat.",
  contactDetails: "Coordonnées",
  keepSupplierInformationCurrent:
    "Gardez les informations des fournisseurs à jour",
  contactDetailsDescription:
    "Conservez les numéros de téléphone, adresses e-mail et informations fiscales des fournisseurs pour les consulter facilement.",
  supplierRegister: "Registre des fournisseurs",
  supplierDirectory: "Répertoire des fournisseurs",
  supplierDirectoryDescription:
    "Consultez les entreprises auprès desquelles vous achetez.",
  addAnotherSupplier: "Ajouter un autre fournisseur",
  noSuppliersYet: "Aucun fournisseur pour le moment",
  addFirstSupplierDescription:
    "Ajoutez votre premier fournisseur pour commencer à gérer vos relations d'achat.",
  addFirstSupplier: "Ajouter votre premier fournisseur",
  tax: "Taxe",
  contact: "Contact",
  currency: "Devise",
  creditTerms: "Conditions de crédit",
  immediate: "Immédiat",
  days: "jours",
  status: "Statut",
  action: "Action",
  active: "Actif",
  inactive: "Inactif",
  purchasingConnection:
    "Les fournisseurs sont directement liés aux achats",
  purchasingConnectionDescription:
    "Utilisez votre répertoire de fournisseurs lors de la création des achats et de la gestion des stocks entrants.",
  openPurchases: "Ouvrir les achats",
  noPhone: "Aucun téléphone",
  noEmail: "Aucune adresse e-mail",
  addSupplierDescription: "Ajoutez un fournisseur auprès duquel votre entreprise effectue des achats.",
supplierInformation: "Informations sur le fournisseur",
supplierName: "Nom du fournisseur",
supplierNamePlaceholder: "ex. ABC Distributors",
phone: "Téléphone",
email: "E-mail",
optional: "Facultatif",
address: "Adresse",
optionalSupplierAddress: "Adresse facultative du fournisseur",
taxNumber: "Numéro fiscal",
selectCurrency: "Sélectionner une devise",
saving: "Enregistrement...",
saveSupplier: "Enregistrer le fournisseur",
unableToSaveSupplier: "Impossible d'enregistrer le fournisseur.",
},

    setup: {
      title: "Configurez votre entreprise",
      businessName: "Nom de l'entreprise",
      businessType: "Type d'entreprise",
      country: "Pays",
      city: "Ville",
      currency: "Devise",
      continue: "Continuer",
	  businessInformation: "Informations sur l’entreprise",
businessInformationDescription: "Commencez par les informations essentielles de votre entreprise.",
businessNamePlaceholder: "ex. Restaurant Keya",
businessTypeDescription: "Cela nous aide à préparer les outils adaptés à votre entreprise.",
regionalSettings: "Paramètres régionaux",
regionalSettingsDescription: "Nous utiliserons votre pays comme point de départ, mais vous pouvez personnaliser ces paramètres.",
baseCurrency: "Devise de base",
firstLocation: "Premier emplacement",
firstLocationDescription: "Commencez avec une succursale et un emplacement de stock. Vous pourrez en ajouter d’autres plus tard.",
branchName: "Nom de la succursale",
mainBranchPlaceholder: "Succursale principale",
branchCode: "Code de la succursale",
inventoryLocation: "Emplacement de stock",
mainWarehousePlaceholder: "Entrepôt principal",
locationCode: "Code de l’emplacement",
setupSummary: "Résumé de la configuration",
business: "Entreprise",
type: "Type",

branch: "Succursale",
notProvided: "Non renseigné",
setupReady: "La configuration de votre entreprise est valide et prête à être enregistrée.",
checkInformation: "Veuillez vérifier les informations indiquées.",
unableToSaveSetup: "Impossible d’enregistrer la configuration de votre entreprise.",
restaurant: "Restaurant",
restaurantDescription:
  "Gérez les aliments, les boissons, les ventes, les stocks et les achats.",

bar: "Bar",
barDescription:
  "Gérez les boissons, les stocks, les ventes, les achats et la trésorerie.",

hotel: "Hôtel",
hotelDescription:
  "Gérez les opérations de l’hôtel, les ventes, les stocks et les services.",

hospitalClinic: "Hôpital / Clinique",
hospitalClinicDescription:
  "Gérez les fournitures, les médicaments, les ventes, les achats et les activités opérationnelles.",

supermarket: "Supermarché",
supermarketDescription:
  "Gérez les produits, les ventes par code-barres, les stocks, les fournisseurs et les clients.",

shop: "Boutique",
shopDescription:
  "Gérez les produits, les ventes, les stocks, les achats et les clients.",
boutique: "Boutique / Services de beauté",
boutiqueDescription:
  "Gérez les produits de la boutique, les services de salon et de beauté, les clients, les ventes et les rendez-vous.",
otherBusiness: "Autre entreprise",
otherBusinessDescription:
  "Commencez avec les outils essentiels et configurez davantage votre entreprise plus tard.",
heading: "Configurez votre entreprise",
description:
  "Parlez-nous de votre entreprise afin que nous puissions configurer les outils adaptés.",
language: "Langue",
timezone: "Fuseau horaire",
 },
restaurantDashboard: {
  restaurantOverviewBreadcrumb: "Restaurant / Vue d’ensemble",
  title: "Tableau de bord du restaurant",
  description: "Suivez les opérations, les menus, les stocks et les ventes de votre restaurant depuis un seul endroit.",
  restaurantOverview: "Vue d’ensemble du restaurant",
  salesToday: "Ventes du jour",
  foodCost: "Coût des aliments",
  ingredientCostToday: "Coût des ingrédients pour les ventes terminées aujourd’hui",
  grossProfit: "Marge brute",
  salesLessFoodCostToday: "Ventes moins le coût des aliments aujourd’hui",
  grossMargin: "Taux de marge brute",
  grossProfitPercentage: "Marge brute en pourcentage des ventes",
  restaurantActivityMetrics: "Indicateurs d’activité du restaurant",
  averageSale: "Vente moyenne",
  averageCompletedSaleToday: "Vente moyenne terminée aujourd’hui",
  completedSales: "Ventes terminées",
  completedSalesRecordedToday: "Ventes terminées enregistrées aujourd’hui",
  todaysSalesBreakdown: "Détail des ventes du jour",
  menuItemSalesFromCompletedTransactions: "Ventes par article du menu provenant des transactions terminées aujourd’hui.",
  noMenuItemSalesToday: "Aucune vente d’article du menu aujourd’hui",
  completedRestaurantSalesWillAppearHere: "Les ventes terminées du restaurant apparaîtront ici.",
  menuItem: "Article du menu",
  quantity: "Quantité",
  revenue: "Chiffre d’affaires",
  quickActions: "Actions rapides",
  quickActionsDescription: "Effectuez rapidement les tâches courantes du restaurant.",
  open: "Ouvrir",
  restaurantPerformance: "Performance du restaurant",
  todaysOperatingPerformance: "Performance opérationnelle du jour.",
  sales: "Ventes",
  topSellingMenuItems: "Articles du menu les plus vendus",
  bestSellingRestaurantItemsToday: "Articles du restaurant les plus vendus aujourd’hui.",
  recentSales: "Ventes récentes",
  latestCompletedRestaurantSales: "Dernières ventes terminées du restaurant.",
  noCompletedSalesToday: "Aucune vente terminée aujourd’hui",
  completedSalesWillAppearHere: "Les ventes terminées apparaîtront ici.",
  lowStockIngredients: "Ingrédients en stock faible",
  ingredientsNeedReplenishment: "Ingrédients susceptibles de nécessiter un réapprovisionnement.",
  noActiveWarehouse: "Aucun entrepôt actif",
  addActiveWarehouse: "Ajoutez un entrepôt actif pour surveiller le stock des ingrédients.",
  noLowStockIngredients: "Aucun ingrédient en stock faible",
  ingredientBalancesAboveThreshold: "Les niveaux actuels des ingrédients sont au-dessus du seuil d’alerte.",
  replenish: "Réapprovisionner",
  menuProfitability: "Rentabilité du menu",
  menuItemsRankedByGrossProfit: "Articles du menu classés par marge brute.",
  noMenuProfitabilityData: "Aucune donnée de rentabilité du menu",
  addRecipesForProfitability: "Ajoutez des recettes et les coûts de stock pour calculer la rentabilité.",
  sellingPrice: "Prix de vente",
  margin: "Marge",
  recordSale: "Enregistrer une vente",
  recordSaleDescription: "Enregistrez une vente du restaurant.",
  manageMenus: "Gérer les menus",
  manageMenusDescription: "Gérez les plats, les boissons et les articles du menu.",
  manageInventory: "Gérer le stock",
  manageInventoryDescription: "Consultez le stock et les mouvements d’inventaire.",
  addStock: "Ajouter du stock",
  addStockDescription: "Réceptionnez les ingrédients dans le stock.",
  sale: "vente",
  recordedToday: "enregistrée aujourd’hui",
  sold: "vendu",
  item: "article",
  items: "articles",
},

restaurantMenu: {
  title: "Menus",
  breadcrumb: "Restaurant / Menu",
  description:
    "Gérez les menus et les articles proposés aux clients par votre restaurant.",
  createMenu: "Créer un menu",
  noMenusYet: "Aucun menu pour le moment",
  createFirstMenuDescription:
    "Créez votre premier menu de restaurant pour commencer à ajouter des plats, des boissons et d’autres articles proposés aux clients.",
  createFirstMenu: "Créer votre premier menu",
  yourMenus: "Vos menus",
  menu: "menu",
  menus: "menus",

  noDescription: "Aucune description ajoutée.",
  menuItems: "Articles du menu",
  menuInformation: "Informations sur le menu",
  menuName: "Nom du menu",
  menuNamePlaceholder: "ex. Menu principal",
  descriptionLabel: "Description",
  descriptionPlaceholder:
    "Description facultative de ce menu",
  cancel: "Annuler",
  creating: "Création...",
  unableToCreateMenu:
    "Impossible de créer le menu.",
  createMenuPageDescription:
    "Créez un menu pour les produits et les plats proposés par votre restaurant.",
  backToMenus: "Menus",
  restaurantMenuBreadcrumb: "Restaurant / Menu",
  addMenuItem: "Ajouter un article au menu",

  noMenuItemsYet: "Aucun article au menu",
  addMenuItemsDescription:
    "Ajoutez les plats, boissons ou autres articles proposés dans ce menu.",
  addFirstMenuItem: "Ajouter votre premier article au menu",

  item: "article",
  items: "articles",
  inThisMenu: "dans ce menu",

  costingWarehouse: "Entrepôt de calcul des coûts",
  warehouseRequiredForCosting:
    "Entrepôt requis pour le calcul des coûts",
  addActiveWarehouseForProfitability:
    "Ajoutez un entrepôt actif pour calculer la rentabilité des articles du menu.",

  createMenuError: "Impossible de créer le menu.",
  unavailable: "Indisponible",

  recipeCost: "Coût de la recette",
  grossProfit: "Marge brute",
  grossMargin: "Taux de marge brute",

  noRecipeCostingAvailable:
    "Aucun calcul de coût de recette disponible",
  addRecipeIngredientsForProfitability:
    "Ajoutez une recette et des ingrédients pour calculer la rentabilité.",
  createMenuItemError:
  "Impossible de créer l’article du menu.",
menuItemInformation:
  "Informations sur l’article du menu",
inventoryProduct:
  "Produit d’inventaire",
standaloneMenuItem:
  "Article de menu autonome",
inventoryProductDescription:
  "Facultatif. Associez cet article à un produit d’inventaire existant.",
itemName:
  "Nom de l’article",
itemNamePlaceholder:
  "ex. Poulet et frites",
optionalDescription:
  "Description facultative",
sellingPrice:
  "Prix de vente",
availableOnMenu:
  "Disponible sur le menu",
creatingMenuItem:
  "Création en cours...",
  menuItem: "Article du menu",
available: "Disponible",

itemDetails: "Détails de l’article",

availability: "Disponibilité",
availableForSale: "Disponible à la vente",
currentlyUnavailable: "Actuellement indisponible",

sku: "SKU",
operations: "Opérations",
recipeAndCosting: "Recette et calcul des coûts",
recipeAndCostingDescription:
  "Gérez la recette utilisée pour préparer cet article du menu, y compris ses ingrédients et son calcul des coûts.",
manageRecipe: "Gérer la recette",
},

services: {
  serviceCatalogueLabel: "Catalogue des services",
  title: "Services",
  description:
    "Gérez les services proposés par votre boutique, notamment leurs prix et leur disponibilité.",
  addService: "Ajouter un service",
  totalServices: "Total des services",
  servicesInCatalogue: "Services dans votre catalogue",
  activeServices: "Services actifs",
  currentlyAvailable: "Actuellement disponibles",
  catalogue: "Catalogue",
  yourServices: "Vos services",
  manageServicesDescription:
    "Recherchez, consultez et gérez les services de votre catalogue.",
  noServicesYet: "Aucun service pour le moment",
  createFirstServiceDescription:
    "Ajoutez votre premier service pour commencer à créer le catalogue de services de votre boutique.",
  createFirstService: "Créer votre premier service",
  price: "Prix",
  active: "Actif",
  inactive: "Inactif",
  serviceCategories: "Catégories de services",
  categories: "Catégories",
  categoriesDescription:
    "Organisez les services de votre boutique en catégories claires.",
  selectCategory: "Sélectionner une catégorie",
  deactivateCategory: "Désactiver la catégorie",
  activateCategory: "Activer la catégorie",
  categoryStatus: "Statut de la catégorie",
  activeCategories: "Catégories actives",
inactiveCategories: "Catégories inactives",
addCategory: "Ajouter une catégorie",
categoryName: "Nom de la catégorie",
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
	  services: "አገልግሎቶች",
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
  tax: "ግብር",

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

inventory: {
  title: "የእቃ ክምችት",
  description:
    "ምርቶችን ያስተዳድሩ፣ የእቃ ክምችት ደረጃዎችን ይከታተሉ እና ክምችትዎን በቁጥጥር ስር ያድርጉ።",
  selectSourceWarehouseRequired:
  "እባክዎ የመነሻ መጋዘን ይምረጡ።",
selectDestinationWarehouseRequired:
  "እባክዎ የመድረሻ መጋዘን ይምረጡ።",
warehousesMustBeDifferent:
  "የመነሻና የመድረሻ መጋዘኖች የተለያዩ መሆን አለባቸው።",
transferQuantityPositive:
  "የሚተላለፈው መጠን ከዜሮ በላይ መሆን አለበት።",
stockTransferredSuccessfully:
  "በተሳካ ሁኔታ ተላልፏል።",
transferStockError:
  "ዕቃ ማስተላለፍ አልተሳካም።",
fromWarehouse:
  "ከመጋዘን",
selectSourceWarehouse:
  "የመነሻ መጋዘን ይምረጡ",
toWarehouse:
  "ወደ መጋዘን",
selectDestinationWarehouse:
  "የመድረሻ መጋዘን ይምረጡ",
enterQuantity:
  "መጠን ያስገቡ",
optionalTransferNotes:
  "አማራጭ የማስተላለፊያ ማስታወሻዎች",
transferring:
  "በማስተላለፍ ላይ...",
  stockLevelsHealthy:
    "የእቃ ክምችት ደረጃዎች ጥሩ ናቸው",
  products: "ምርቶች",
  unitsInStock: "በክምችት ያሉ ክፍሎች",
  lowStock: "ዝቅተኛ ክምችት",
  stockValue: "የክምችት ዋጋ",
  quickActions: "ፈጣን እርምጃዎች",
  receiveStock: "እቃ ይቀበሉ",
  receiveStockDescription:
    "እቃ ይቀበሉ እና የሚገኙ መጠኖችን ያዘምኑ።",
  adjustStock: "ክምችት ያስተካክሉ",
  adjustStockDescription:
    "አስፈላጊ ሲሆን የክምችት መጠኖችን ያስተካክሉ።",
  transferStock: "ክምችት ያስተላልፉ",
  transferStockDescription:
    "እቃን በመጋዘኖች መካከል ያንቀሳቅሱ።",
  currentStockLevels: "የአሁኑ የክምችት ደረጃዎች",
  stockAlerts: "የክምችት ማስጠንቀቂያዎች",
  noStockRecordsYet:
    "እስካሁን የክምችት መዝገብ የለም",
  outOfStock: "እቃ ከክምችት ውጭ ነው",
  lowStockStatus: "ዝቅተኛ ክምችት",
  manageProducts: "ምርቶችን ያስተዳድሩ",
  stockMovements: "የክምችት እንቅስቃሴዎች",
  warehouses: "መጋዘኖች",
  viewInventory: "ክምችትን ይመልከቱ",

  itemsActivelyTracked: "በንቃት የሚከታተሉ እቃዎች",
  acrossActiveStockBalances:
    "በንቃት በሚተዳደሩ የክምችት መዝገቦች ላይ",
  belowConfiguredThreshold:
    "ከተወሰነው ገደብ በታች",
  basedOnAverageStockCost:
    "በአማካይ የክምችት ዋጋ ላይ የተመሰረተ",
  operations: "ስራዎች",
  commonTasks:
    "የእቃ ክምችትዎን ትክክለኛ ለማድረግ የሚያስፈልጉ የተለመዱ ስራዎች።",

  inbound: "ገቢ እቃ",
  correction: "ማስተካከያ",
  movement: "እንቅስቃሴ",
  liveStock: "የአሁኑ ክምችት",
  viewHistory: "ታሪክ ይመልከቱ",
  latestStockBalances:
    "በመጋዘን የተደራጁ የቅርብ ጊዜ የክምችት መጠኖች።",
  receiveFirstStock:
    "ክምችትዎን ለመጀመር የመጀመሪያውን የእቃ እንቅስቃሴ ይመዝግቡ።",
  attention: "ትኩረት",
  itemsNeedReplenishment:
    "እንደገና መሙላት ሊያስፈልጋቸው የሚችሉ እቃዎች።",
  stockLevelsLookHealthy:
    "የክምችት ደረጃዎች ጥሩ ይመስላሉ",
  noProductsBelowThreshold:
    "በአሁኑ ጊዜ ከተወሰነው ገደብ በታች ያሉ ምርቶች የሉም።",
  currentQuantity: "የአሁኑ መጠን",
  threshold: "ገደብ",
  viewAllProducts: "ሁሉንም ምርቶች ይመልከቱ",
  activity: "እንቅስቃሴ",
  reviewStockMovements:
    "የእቃ መቀበያዎችን፣ ማስተላለፎችን እና ማስተካከያዎችን ይገምግሙ።",
  openCatalogue: "ካታሎጉን ይክፈቱ",
  productsAndServices: "ምርቶች እና አገልግሎቶች",
  viewMovements: "እንቅስቃሴዎችን ይመልከቱ",
  activeInventoryLocations:
    "ንቁ የእቃ ክምችት ቦታዎች",
	createProductOrService:
  "ምርት ወይም አገልግሎት ይፍጠሩ።",
itemsNeedAttention:
  "ትኩረት ሊያስፈልጋቸው የሚችሉ እቃዎች።",
heroDescription:
  "ምርቶችን ያስተዳድሩ፣ የክምችት ደረጃዎችን ይከታተሉ እና ክምችትዎን በቁጥጥር ስር ያድርጉ።",
adjustStockPageDescription:
  "ከአካላዊ የእቃ ቆጠራ ወይም ከሌላ የክምችት ማስተካከያ በኋላ የእቃ መጠኖችን ያስተካክሉ።",
product: "ምርት",
  warehouse: "መጋዘን",
  selectProduct: "ምርት ይምረጡ",
  selectWarehouse: "መጋዘን ይምረጡ",
  adjustmentQuantity: "የማስተካከያ መጠን",
  adjustmentQuantityPlaceholder:
    "ለምሳሌ -4 ወይም +5",
  adjustmentQuantityHelp:
    "ክምችትን ለመቀነስ አሉታዊ ቁጥር፣ ክምችትን ለመጨመር አዎንታዊ ቁጥር ይጠቀሙ።",
  currency: "ምንዛሬ",
  adjustmentReason: "ምክንያት / ማስታወሻዎች",
  adjustmentReasonPlaceholder:
    "ማስተካከያው ለምን እንደሚደረግ ያብራሩ",
  selectProductRequired:
    "እባክዎ ምርት ይምረጡ።",
  selectWarehouseRequired:
    "እባክዎ መጋዘን ይምረጡ።",
  adjustmentQuantityZero:
    "የማስተካከያ መጠን ዜሮ ሊሆን አይችልም።",
  selectedProductNotFound:
    "የተመረጠው ምርት አልተገኘም።",
  adjustmentReasonRequired:
    "እባክዎ ለማስተካከያው ምክንያት ያቅርቡ።",
  stockAdjustedBy: "ክምችት በ",
  forProduct: "ለ",
  adjustStockError:
    "ክምችትን ማስተካከል አልተሳካም።",
  adjusting: "በማስተካከል ላይ",
  movementHistory: "የክምችት እንቅስቃሴ ታሪክ",
movementHistoryDescription:
  "የእቃ መቀበያዎችን፣ ማስተካከያዎችን እና ሌሎች የክምችት እንቅስቃሴዎችን ይመልከቱ።",
all: "ሁሉም",
allProducts: "ሁሉም ምርቶች",
allWarehouses: "ሁሉም መጋዘኖች",
from: "ከ",
to: "እስከ",
applyDates: "ቀኖችን ተግብር",
noInventoryMovements:
  "እስካሁን የክምችት እንቅስቃሴ የለም",
inventoryMovementsEmptyDescription:
  "የእቃ መቀበያዎች እና ማስተካከያዎች እዚህ ይታያሉ።",
date: "ቀን",
type: "ዓይነት",
quantity: "መጠን",
unitCost: "የአንድ ክፍል ዋጋ",
totalCost: "ጠቅላላ ዋጋ",
notes: "ማስታወሻዎች",
productCatalogue: "ምርቶች",
productCatalogueDescription:
  "የንግድዎ የሚሸጣቸውን ምርቶችና አገልግሎቶች፣ ዋጋቸውን እና የክምችት ክትትላቸውን ያስተዳድሩ።",
catalogue: "ካታሎግ",
productCatalogueLabel: "የምርት ካታሎግ",
manageProductsAndServices:
  "የንግድዎ የሚሸጣቸውን ምርቶችና አገልግሎቶች፣ ዋጋቸውን እና የክምችት ክትትላቸውን ያስተዳድሩ።",
addProduct: "ምርት ያክሉ",
productSummary: "የምርት ማጠቃለያ",
active: "ንቁ",
currentlyAvailable: "በአሁኑ ጊዜ ይገኛሉ",
stockTracked: "ክምችት የሚከታተል",
productsConnectedToInventory:
  "ከክምችት ጋር የተገናኙ ምርቶች",
inactive: "ንቁ ያልሆኑ",
notCurrentlyAvailable: "በአሁኑ ጊዜ አይገኙም",
yourProducts: "ምርቶችዎ",
searchReviewEditProducts:
  "የንግድዎ የሚሸጣቸውን እቃዎች ይፈልጉ፣ ይመልከቱ እና ያርትዑ።",
addAnotherProduct: "ሌላ ምርት ያክሉ",
productCatalogueEmpty:
  "የምርት ካታሎግዎ ባዶ ነው",
addFirstProductDescription:
  "የመጀመሪያዎን ምርት ወይም አገልግሎት በመጨመር ዋጋ፣ ሽያጭ እና ክምችትን በTeketeke ማስተዳደር ይጀምሩ።",
addYourFirstProduct:
  "የመጀመሪያዎን ምርት ያክሉ",
keepCatalogueAccurate:
  "ካታሎግዎን ትክክለኛ ያድርጉ",
catalogueOperationsDescription:
  "የምርት ዋጋ እና የክምችት ቅንብሮች ወደ አጠቃላይ የንግድ ሥራዎ ይገባሉ።",
openInventory: "ክምችት ይክፈቱ",
productIdRequired:
  "ለማስተካከል የምርት መለያ ያስፈልጋል።",
editProduct: "ምርት ያርትዑ",
optional: "አማራጭ",
service: "አገልግሎት",
optionalDescription: "አማራጭ መግለጫ",
selectCurrency: "ምንዛሬ ይምረጡ",
noProductsFound: "ምንም ምርት አልተገኘም",
productSearchEmptyDescription:
  "የተለየ የምርት ስም፣ SKU ወይም ባርኮድ ይሞክሩ።",
sellingPrice: "የሽያጭ ዋጋ",
stock: "ክምችት",
status: "ሁኔታ",
action: "እርምጃ",
tracked: "የሚከታተል",
notTracked: "የማይከታተል",
edit: "አርትዕ",
searchProducts: "ምርቶችን ይፈልጉ...",
searching: "በመፈለግ ላይ...",
addProductDescription:
  "ምርት ወይም አገልግሎት ወደ ንግድዎ ያክሉ።",
basicInformation: "መሰረታዊ መረጃ",
productName: "የምርት ስም",
barcode: "ባርኮድ",
unit: "ክፍል",
pricing: "ዋጋ",
costPrice: "የግዢ ዋጋ",
stockSettings: "የክምችት ቅንብሮች",
trackStock: "የዚህን እቃ ክምችት ይከታተሉ",
trackStockDescription:
  "ለአገልግሎቶች ወይም የክምችት ክትትል ለማያስፈልጋቸው እቃዎች ይህንን ያጥፉ።",
minimumStock: "ዝቅተኛ ክምችት",
reorderLevel: "የድጋሚ ማዘዣ ደረጃ",
saving: "በማስቀመጥ ላይ...",
saveProduct: "ምርት አስቀምጥ",
saveProductError:
  "ምርቱን ማስቀመጥ አልተቻለም።",
  optionalReceiptNotes:
  "አማራጭ የመቀበያ ማስታወሻዎች",
receiving:
  "በመቀበል ላይ...",
  backToInventory: "ወደ ኢንቬንተሪ ተመለስ",
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

    expenses: {
      title: "ወጪዎች",
      finance: "ፋይናንስ",
      description:
        "የንግድ ወጪዎችን፣ የክፍያ ግዴታዎችን እና የሥራ ማስኬጃ ወጪዎችን ከአንድ ቦታ ይቆጣጠሩ።",
      recordExpense: "ወጪ ይመዝግቡ",

      totalExpenses: "ጠቅላላ ወጪዎች",
      expense: "ወጪ",
      expenses: "ወጪዎች",
      onRecord: "በመዝገብ ላይ",

      paid: "ተከፍሏል",
      fullyPaid: "ሙሉ በሙሉ ተከፍሏል",
      partial: "ከፊል",
      partiallyPaid: "በከፊል ተከፍሏል",
      outstanding: "ያልተከፈለ",
      unpaid: "ያልተከፈለ",

      spendingOverview: "የወጪ አጠቃላይ እይታ",
      whereMoneyIsGoing: "ገንዘብ ወዴት እየሄደ ነው",
      largestExpenseCategories:
        "በተመዘገቡ ወጪዎች መሠረት ትልቁ የወጪ ምድቦችዎ።",
      noSpendingCategories: "እስካሁን የወጪ ምድቦች የሉም",
      spendingCategoriesWillAppearHere:
        "ወጪዎችን ሲመዘግቡ የወጪ ምድቦች እዚህ ይታያሉ።",

      paymentHealth: "የክፍያ ሁኔታ",
      expenseObligations: "የወጪ ክፍያ ግዴታዎች",
      seeHowExpensesAreSettling:
        "የተመዘገቡ ወጪዎችዎ የክፍያ ሁኔታን ይመልከቱ።",

      expenseRegister: "የወጪ መዝገብ",
      businessSpending: "የንግድ ወጪ",
      reviewRecordedExpenses:
        "የተመዘገቡ ወጪዎችን እና የክፍያ ግዴታዎችን ይመልከቱ።",
      recordAnotherExpense: "ሌላ ወጪ ይመዝግቡ",

      category: "ምድብ",
      descriptionLabel: "መግለጫ",
      date: "ቀን",
      amount: "መጠን",
      payment: "ክፍያ",
      action: "እርምጃ",
      created: "የተፈጠረ",
      viewDetails: "ዝርዝሮችን ይመልከቱ",

      noExpensesYet: "እስካሁን ወጪ የለም",
      recordFirstExpenseDescription:
        "የሥራ ማስኬጃ ወጪዎችን እና የክፍያ ግዴታዎችን ለመከታተል የመጀመሪያውን የንግድ ወጪዎን ይመዝግቡ።",
      recordFirstExpense: "የመጀመሪያውን ወጪ ይመዝግቡ",

      financeConnectionTitle:
        "ወጪዎች የፋይናንስ ሁኔታዎ አካል ናቸው",
      financeConnectionDescription:
        "ወጪዎችን ከሽያጭ፣ ግዢ እና ከሌሎች የንግድ ሥራዎችዎ ጋር በአንድ ቦታ ይከታተሉ።",
      backToDashboard: "ወደ ዳሽቦርድ ይመለሱ →",

      newExpense: "ወጪ ይመዝግቡ",
      newExpenseDescription:
        "የንግድ ወጪን ይመዝግቡ እና የክፍያ ሁኔታውን ይከታተሉ።",
      cancel: "ሰርዝ",
      saving: "በማስቀመጥ ላይ...",

      reference: "ማጣቀሻ",
      referencePlaceholder: "ለምሳሌ EXP-001",
      categoryPlaceholder:
        "ለምሳሌ ኪራይ፣ መገልገያዎች፣ መጓጓዣ",
      descriptionPlaceholder:
        "ንግዱ ገንዘብ ያወጣበትን ነገር ይግለጹ",
      amountPlaceholder: "0.00",
      expenseDate: "የወጪ ቀን",
      paymentStatus: "የክፍያ ሁኔታ",
      notes: "ማስታወሻዎች",
      notesPlaceholder: "አማራጭ ማስታወሻዎች",

      unpaidStatus: "ያልተከፈለ",
      partiallyPaidStatus: "በከፊል ተከፍሏል",
      paidStatus: "ተከፍሏል",

      recordExpenseError: "ወጪውን መመዝገብ አልተቻለም።",

      backToExpenses: "← ወጪዎች",
      expenseDetails: "የወጪ ዝርዝሮች",
      currency: "ምንዛሬ",
      createdDate: "የተፈጠረ",
      updatePaymentStatus: "የክፍያ ሁኔታ",
      updatePaymentStatusDescription:
        "ወጪው ሲከፈል የክፍያ ሁኔታውን ያዘምኑ።",
      updatingPaymentStatus: "የክፍያ ሁኔታን በማዘመን ላይ...",
      unableToUpdatePaymentStatus:
        "የክፍያ ሁኔታን ማዘመን አልተቻለም።",
      record: "መዝግብ",
    },

	suppliers: {
  title: "አቅራቢዎች",
  breadcrumb: "ግዢ / አቅራቢዎች",
  description:
    "የአቅራቢዎች ግንኙነቶችን፣ የግዢ ውሎችን እና የመገኛ መረጃዎችን በአንድ ቦታ ያስተዳድሩ።",
  addSupplier: "አቅራቢ ያክሉ",
  activeSupplier: "ንቁ አቅራቢ",
  activeSuppliers: "ንቁ አቅራቢዎች",
  supplier: "አቅራቢ",
  suppliersOnRecord: "በመዝገብ ላይ ያሉ አቅራቢዎች",
  availableForPurchasing: "ለግዢ ዝግጁ",
  contactable: "ሊገናኙ የሚችሉ",
  suppliersWithEmail: "ኢሜይል ያላቸው አቅራቢዎች",
  paymentTerms: "የክፍያ ውሎች",
  suppliersWithCreditTerms:
    "የክሬዲት ውሎች ያላቸው አቅራቢዎች",
  supplierManagement: "የአቅራቢ አስተዳደር",
  yourSupplierNetwork: "የአቅራቢዎ አውታረ መረብ",
  supplierNetworkDescription:
    "የግዢ ግንኙነቶችዎን ያደራጁ እና ለሚቀጥለው ትዕዛዝዎ ዝግጁ ያድርጉ።",
  activeSuppliersTitle: "ንቁ አቅራቢዎች",
  readyForPurchasing: "ለግዢ ዝግጁ",
  activeSuppliersDescription:
    "ንቁ አቅራቢዎች ግዢዎችን ሲፈጥሩ እና ሲያስተዳድሩ መጠቀም ይችላሉ።",
  paymentTermsTitle: "የክፍያ ውሎች",
  supplierCreditInformation:
    "የአቅራቢ ክሬዲት መረጃ",
  paymentTermsDescription:
    "ከወዲያውኑ ክፍያ በላይ የክፍያ ውሎችን የሚሰጡ አቅራቢዎችን ይከታተሉ።",
  contactDetails: "የመገኛ መረጃ",
  keepSupplierInformationCurrent:
    "የአቅራቢ መረጃን ወቅታዊ ያድርጉ",
  contactDetailsDescription:
    "የአቅራቢዎችን ስልክ ቁጥሮች፣ የኢሜይል አድራሻዎች እና የግብር መረጃዎችን ለቀላል ማጣቀሻ ያስቀምጡ።",
  supplierRegister: "የአቅራቢዎች መዝገብ",
  supplierDirectory: "የአቅራቢዎች ማውጫ",
  supplierDirectoryDescription:
    "ከእነሱ ጋር ግዢ የሚያደርጉባቸውን ንግዶች ይመልከቱ።",
  addAnotherSupplier: "ሌላ አቅራቢ ያክሉ",
  noSuppliersYet: "እስካሁን ምንም አቅራቢዎች የሉም",
  addFirstSupplierDescription:
    "የግዢ ግንኙነቶችን ማስተዳደር ለመጀመር የመጀመሪያዎን አቅራቢ ያክሉ።",
  addFirstSupplier: "የመጀመሪያዎን አቅራቢ ያክሉ",
  tax: "ግብር",
  contact: "የመገኛ መረጃ",
  currency: "ምንዛሬ",
  creditTerms: "የክሬዲት ውሎች",
  immediate: "ወዲያውኑ",
  days: "ቀናት",
  status: "ሁኔታ",
  action: "እርምጃ",
  active: "ንቁ",
  inactive: "ንቁ ያልሆነ",
  purchasingConnection:
    "አቅራቢዎች በቀጥታ ከግዢ ጋር ይገናኛሉ",
  purchasingConnectionDescription:
    "ግዢዎችን ሲፈጥሩ እና የሚገቡ እቃዎችን ሲያስተዳድሩ የአቅራቢዎች ማውጫዎን ይጠቀሙ።",
  openPurchases: "ግዢዎችን ክፈት",
  noPhone: "ስልክ የለም",
  noEmail: "ኢሜይል የለም",
  addSupplierDescription: "የእርስዎ ንግድ ግዢ የሚያደርግበትን አቅራቢ ያክሉ።",
supplierInformation: "የአቅራቢ መረጃ",
supplierName: "የአቅራቢ ስም",
supplierNamePlaceholder: "ለምሳሌ ABC Distributors",
phone: "ስልክ",
email: "ኢሜይል",
optional: "አማራጭ",
address: "አድራሻ",
optionalSupplierAddress: "አማራጭ የአቅራቢ አድራሻ",
taxNumber: "የግብር ቁጥር",
selectCurrency: "ምንዛሬ ይምረጡ",
saving: "በማስቀመጥ ላይ...",
saveSupplier: "አቅራቢን አስቀምጥ",
unableToSaveSupplier: "አቅራቢውን ማስቀመጥ አልተቻለም።",
},

    setup: {
      title: "ንግድዎን ያዘጋጁ",
      businessName: "የንግድ ስም",
      businessType: "የንግድ አይነት",
      country: "ሀገር",
      city: "ከተማ",
      currency: "ምንዛሬ",
      continue: "ቀጥል",
	  businessInformation: "የንግድ መረጃ",
      businessInformationDescription: "በመጀመሪያ የንግድዎን መሠረታዊ መረጃ ያስገቡ።",
      businessNamePlaceholder: "ለምሳሌ ኬያ ሬስቶራንት",
      businessTypeDescription: "ይህ ለንግድዎ ተስማሚ መሣሪያዎችን ለማዘጋጀት ይረዳናል።",
      regionalSettings: "የክልል ቅንብሮች",
      regionalSettingsDescription: "አገርዎን እንደ መነሻ እንጠቀማለን፣ ነገር ግን እነዚህን ቅንብሮች ማበጀት ይችላሉ።",
      baseCurrency: "መሠረታዊ ምንዛሬ",
      firstLocation: "የመጀመሪያ አካባቢ",
      firstLocationDescription: "በአንድ ቅርንጫፍ እና አንድ የእቃ ማከማቻ አካባቢ ይጀምሩ። በኋላ ተጨማሪ ማከል ይችላሉ።",
      branchName: "የቅርንጫፍ ስም",
      mainBranchPlaceholder: "ዋና ቅርንጫፍ",
      branchCode: "የቅርንጫፍ ኮድ",
      inventoryLocation: "የእቃ ማከማቻ አካባቢ",
      mainWarehousePlaceholder: "ዋና መጋዘን",
      locationCode: "የአካባቢ ኮድ",
      setupSummary: "የቅንብር ማጠቃለያ",
      business: "ንግድ",
      type: "ዓይነት",

      branch: "ቅርንጫፍ",
      notProvided: "አልተሰጠም",
      setupReady: "የንግድዎ ቅንብር ትክክል ነው እና ለመቀመጥ ዝግጁ ነው።",
      checkInformation: "እባክዎ የተጠቆሙትን መረጃዎች ይመልከቱ።",
      unableToSaveSetup: "የንግድዎን ቅንብር ማስቀመጥ አልተቻለም።",
      restaurant: "ሬስቶራንት",
      restaurantDescription:
        "ምግብ፣ መጠጦች፣ ሽያጭ፣ እቃ ክምችት እና ግዢዎችን ያስተዳድሩ።",

      bar: "ባር",
      barDescription:
        "መጠጦችን፣ ክምችትን፣ ሽያጭን፣ ግዢን እና ገንዘብን ያስተዳድሩ።",

      hotel: "ሆቴል",
      hotelDescription:
        "የሆቴል ስራዎችን፣ ሽያጭን፣ እቃ ክምችትን እና አገልግሎቶችን ያስተዳድሩ።",

      hospitalClinic: "ሆስፒታል / ክሊኒክ",
      hospitalClinicDescription:
        "አቅርቦቶችን፣ መድኃኒቶችን፣ ሽያጭን፣ ግዢን እና የስራ እንቅስቃሴዎችን ያስተዳድሩ።",

      supermarket: "ሱፐርማርኬት",
      supermarketDescription:
        "ምርቶችን፣ በባርኮድ ሽያጭን፣ ክምችትን፣ አቅራቢዎችን እና ደንበኞችን ያስተዳድሩ።",

      shop: "ሱቅ",
      shopDescription:
        "ምርቶችን፣ ሽያጭን፣ ክምችትን፣ ግዢን እና ደንበኞችን ያስተዳድሩ።",
      boutique: "ቡቲክ / የውበት አገልግሎቶች",
boutiqueDescription:
  "የቡቲክ ምርቶችን፣ የሳሎን እና የውበት አገልግሎቶችን፣ ደንበኞችን፣ ሽያጮችን እና ቀጠሮዎችን ያስተዳድሩ።",
            otherBusiness: "ሌላ ንግድ",
      otherBusinessDescription:
        "በመሠረታዊ የንግድ መሣሪያዎች ይጀምሩ እና በኋላ ተጨማሪ ያዘጋጁ።",
      heading: "ንግድዎን ያዘጋጁ",
description:
  "ለንግድዎ ተስማሚ መሣሪያዎችን ለማዘጋጀት ስለ ንግድዎ መረጃ ያስገቡ።",
language: "ቋንቋ",
timezone: "የሰዓት ክልል",

   },
restaurantDashboard: {
  restaurantOverviewBreadcrumb: "ሬስቶራንት / አጠቃላይ እይታ",
  title: "የሬስቶራንት ዳሽቦርድ",
  description: "የሬስቶራንትዎን ስራዎች፣ ምናሌዎች፣ ክምችት እና ሽያጮች ከአንድ ቦታ ይከታተሉ።",
  restaurantOverview: "የሬስቶራንት አጠቃላይ እይታ",
  salesToday: "የዛሬ ሽያጮች",
  foodCost: "የምግብ ወጪ",
  ingredientCostToday: "ለዛሬ የተጠናቀቁ ሽያጮች የንጥረ ነገሮች ወጪ",
  grossProfit: "ጠቅላላ ትርፍ",
  salesLessFoodCostToday: "የዛሬ ሽያጭ ከምግብ ወጪ በኋላ",
  grossMargin: "ጠቅላላ የትርፍ ህዳግ",
  grossProfitPercentage: "ጠቅላላ ትርፍ ከሽያጭ ጋር በመቶኛ",
  restaurantActivityMetrics: "የሬስቶራንት እንቅስቃሴ መለኪያዎች",
  averageSale: "አማካይ ሽያጭ",
  averageCompletedSaleToday: "የዛሬ አማካይ የተጠናቀቀ ሽያጭ",
  completedSales: "የተጠናቀቁ ሽያጮች",
  completedSalesRecordedToday: "ዛሬ የተመዘገቡ የተጠናቀቁ ሽያጮች",
  todaysSalesBreakdown: "የዛሬ ሽያጮች ዝርዝር",
  menuItemSalesFromCompletedTransactions: "ዛሬ ከተጠናቀቁ ግብይቶች የምናሌ እቃ ሽያጮች።",
  noMenuItemSalesToday: "ዛሬ የምናሌ እቃ ሽያጭ የለም",
  completedRestaurantSalesWillAppearHere: "የተጠናቀቁ የሬስቶራንት ሽያጮች እዚህ ይታያሉ።",
  menuItem: "የምናሌ እቃ",
  quantity: "መጠን",
  revenue: "ገቢ",
  quickActions: "ፈጣን እርምጃዎች",
  quickActionsDescription: "የተለመዱ የሬስቶራንት ስራዎችን በፍጥነት ያከናውኑ።",
  open: "ክፈት",
  restaurantPerformance: "የሬስቶራንት አፈጻጸም",
  todaysOperatingPerformance: "የዛሬ የስራ አፈጻጸም።",
  sales: "ሽያጮች",
  topSellingMenuItems: "በጣም የተሸጡ የምናሌ እቃዎች",
  bestSellingRestaurantItemsToday: "የዛሬ በጣም የተሸጡ የሬስቶራንት እቃዎች።",
  recentSales: "የቅርብ ጊዜ ሽያጮች",
  latestCompletedRestaurantSales: "የቅርብ ጊዜ የተጠናቀቁ የሬስቶራንት ሽያጮች።",
  noCompletedSalesToday: "ዛሬ የተጠናቀቀ ሽያጭ የለም",
  completedSalesWillAppearHere: "የተጠናቀቁ ሽያጮች እዚህ ይታያሉ።",
  lowStockIngredients: "አነስተኛ ክምችት ያላቸው ንጥረ ነገሮች",
  ingredientsNeedReplenishment: "እንደገና መሙላት ሊያስፈልጋቸው የሚችሉ ንጥረ ነገሮች።",
  noActiveWarehouse: "ንቁ መጋዘን የለም",
  addActiveWarehouse: "የንጥረ ነገሮችን ክምችት ለመከታተል ንቁ መጋዘን ያክሉ።",
  noLowStockIngredients: "አነስተኛ ክምችት ያላቸው ንጥረ ነገሮች የሉም",
  ingredientBalancesAboveThreshold: "የአሁኑ የንጥረ ነገሮች መጠን ከማስጠንቀቂያ ደረጃው በላይ ነው።",
  replenish: "እንደገና ሙላ",
  menuProfitability: "የምናሌ ትርፋማነት",
  menuItemsRankedByGrossProfit: "የምናሌ እቃዎች በጠቅላላ ትርፍ ደረጃ ተሰጥቷቸዋል።",
  noMenuProfitabilityData: "የምናሌ ትርፋማነት መረጃ የለም",
  addRecipesForProfitability: "ትርፋማነትን ለማስላት ሬሲፖችን እና የክምችት ወጪዎችን ያክሉ።",
  sellingPrice: "የሽያጭ ዋጋ",
  margin: "ህዳግ",
  recordSale: "ሽያጭ ይመዝግቡ",
  recordSaleDescription: "የሬስቶራንት ሽያጭ ይመዝግቡ።",
  manageMenus: "ምናሌዎችን ያስተዳድሩ",
  manageMenusDescription: "ምግቦችን፣ መጠጦችን እና የምናሌ እቃዎችን ያስተዳድሩ።",
  manageInventory: "ክምችትን ያስተዳድሩ",
  manageInventoryDescription: "የእቃ ክምችትን እና የክምችት እንቅስቃሴዎችን ይመልከቱ።",
  addStock: "ክምችት ያክሉ",
  addStockDescription: "ንጥረ ነገሮችን ወደ ክምችት ይቀበሉ።",
  sale: "ሽያጭ",
  recordedToday: "ዛሬ ተመዝግቧል",
  sold: "ተሽጧል",
  item: "እቃ",
  items: "እቃዎች",
},

restaurantMenu: {
  title: "ምናሌዎች",
  breadcrumb: "ሬስቶራንት / ምናሌ",
  description:
    "በሬስቶራንትዎ የሚቀርቡ ምናሌዎችን እና ለደንበኞች የሚታዩ እቃዎችን ያስተዳድሩ።",
  createMenu: "ምናሌ ይፍጠሩ",
  noMenusYet: "እስካሁን ምንም ምናሌ የለም",
  createFirstMenuDescription:
    "ምግቦችን፣ መጠጦችን እና ሌሎች ለደንበኞች የሚቀርቡ እቃዎችን ለመጨመር የመጀመሪያዎን የሬስቶራንት ምናሌ ይፍጠሩ።",
  createFirstMenu: "የመጀመሪያዎን ምናሌ ይፍጠሩ",
  yourMenus: "የእርስዎ ምናሌዎች",
  menu: "ምናሌ",
  menus: "ምናሌዎች",

  noDescription: "ምንም መግለጫ አልተጨመረም።",
  menuItems: "የምናሌ እቃዎች",
  menuInformation: "የምናሌ መረጃ",
  menuName: "የምናሌ ስም",
  menuNamePlaceholder: "ለምሳሌ ዋና ምናሌ",
  descriptionLabel: "መግለጫ",
  descriptionPlaceholder:
    "የዚህ ምናሌ አማራጭ መግለጫ",
  cancel: "ሰርዝ",
  creating: "በመፍጠር ላይ...",
  unableToCreateMenu:
    "ምናሌውን መፍጠር አልተቻለም።",
  createMenuPageDescription:
    "ሬስቶራንትዎ ለሚያቀርባቸው ምርቶችና ምግቦች ምናሌ ይፍጠሩ።",

   backToMenus: "ምናሌዎች",
   restaurantMenuBreadcrumb: "ሬስቶራንት / ምናሌ",
   addMenuItem: "የምናሌ እቃ ያክሉ",

   noMenuItemsYet: "እስካሁን ምንም የምናሌ እቃዎች የሉም",
   addMenuItemsDescription:
     "በዚህ ምናሌ ላይ የሚቀርቡ ምግቦችን፣ መጠጦችን ወይም ሌሎች እቃዎችን ያክሉ።",
   addFirstMenuItem: "የመጀመሪያዎን የምናሌ እቃ ያክሉ",

   item: "እቃ",
   items: "እቃዎች",
   inThisMenu: "በዚህ ምናሌ ውስጥ",

   costingWarehouse: "የወጪ ማስሊያ መጋዘን",
   warehouseRequiredForCosting:
     "የወጪ ስሌት ለማድረግ መጋዘን ያስፈልጋል",
   addActiveWarehouseForProfitability:
     "የምናሌ እቃዎችን ትርፋማነት ለማስላት ንቁ መጋዘን ያክሉ።",

   createMenuError: "ምናሌውን መፍጠር አልተቻለም።",
   unavailable: "አይገኝም",

   recipeCost: "የምግብ ዝግጅት ወጪ",
   grossProfit: "ጠቅላላ ትርፍ",
   grossMargin: "ጠቅላላ የትርፍ ምጣኔ",

   noRecipeCostingAvailable:
     "የምግብ ዝግጅት ወጪ ስሌት አይገኝም",
   addRecipeIngredientsForProfitability:
     "ትርፋማነትን ለማስላት የምግብ ዝግጅት እና ግብዓቶችን ያክሉ።",
	 createMenuItemError:
  "የምናሌ እቃውን መፍጠር አልተቻለም።",
menuItemInformation:
  "የምናሌ እቃ መረጃ",
inventoryProduct:
  "የእቃ ክምችት ምርት",
standaloneMenuItem:
  "ራሱን የቻለ የምናሌ እቃ",
inventoryProductDescription:
  "አማራጭ። ይህን የምናሌ እቃ ከነባር የእቃ ክምችት ምርት ጋር ያገናኙ።",
itemName:
  "የእቃ ስም",
itemNamePlaceholder:
  "ለምሳሌ ዶሮ እና ቺፕስ",
optionalDescription:
  "አማራጭ መግለጫ",
sellingPrice:
  "የሽያጭ ዋጋ",
availableOnMenu:
  "በምናሌው ላይ ይገኛል",
creatingMenuItem:
  "በመፍጠር ላይ...",
  menuItem: "የምናሌ እቃ",
available: "ይገኛል",

itemDetails: "የእቃ ዝርዝሮች",

availability: "ተገኝነት",
availableForSale: "ለሽያጭ ይገኛል",
currentlyUnavailable: "በአሁኑ ጊዜ አይገኝም",

sku: "SKU",
operations: "ስራዎች",
recipeAndCosting: "የምግብ አሰራር እና የወጪ ስሌት",
recipeAndCostingDescription:
  "ይህን የምናሌ እቃ ለማዘጋጀት የሚጠቀሙበትን የምግብ አሰራር፣ ንጥረ ነገሮቹን እና የወጪ ስሌቱን ያስተዳድሩ።",
manageRecipe: "የምግብ አሰራርን ያስተዳድሩ",
},

services: {
  serviceCatalogueLabel: "የአገልግሎት ካታሎግ",
  title: "አገልግሎቶች",
  description:
    "ቡቲክዎ የሚያቀርባቸውን አገልግሎቶች፣ ዋጋቸውን እና ተገኝነታቸውን ያስተዳድሩ።",
  addService: "አገልግሎት ያክሉ",
  totalServices: "ጠቅላላ አገልግሎቶች",
  servicesInCatalogue: "በካታሎግዎ ውስጥ ያሉ አገልግሎቶች",
  activeServices: "ንቁ አገልግሎቶች",
  currentlyAvailable: "በአሁኑ ጊዜ የሚገኙ",
  catalogue: "ካታሎግ",
  yourServices: "የእርስዎ አገልግሎቶች",
  manageServicesDescription:
    "በካታሎግዎ ውስጥ ያሉ አገልግሎቶችን ይፈልጉ፣ ይገምግሙ እና ያስተዳድሩ።",
  noServicesYet: "እስካሁን አገልግሎት የለም",
  createFirstServiceDescription:
    "የቡቲክዎን የአገልግሎት ካታሎግ ለመጀመር የመጀመሪያዎን አገልግሎት ያክሉ።",
  createFirstService: "የመጀመሪያዎን አገልግሎት ይፍጠሩ",
  price: "ዋጋ",
  active: "ንቁ",
  inactive: "እንቅስቃሴ የሌለው",
  serviceCategories: "የአገልግሎት ምድቦች",
  categories: "ምድቦች",
  categoriesDescription:
    "የቡቲክዎን አገልግሎቶች በግልጽ ምድቦች ያደራጁ።",
	selectCategory: "ምድብ ይምረጡ",
	deactivateCategory: "ምድቡን ያቦዝኑ",
  activateCategory: "ምድቡን ያንቁ",
  categoryStatus: "የምድብ ሁኔታ",
  activeCategories: "ንቁ ምድቦች",
inactiveCategories: "የቦዘኑ ምድቦች",
addCategory: "ምድብ ጨምር",
categoryName: "የምድብ ስም",
},
  },
};