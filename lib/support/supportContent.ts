export interface SupportStep {
  title: string;
  description: string;
}

export interface SupportArticle {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingTime: string;
  introduction: string;
  steps: SupportStep[];
  tip?: string;
}

export const supportArticles: SupportArticle[] = [
  {
    slug: "create-your-account",
    title: "Create your SmatPic account",
    category: "Getting started",
    excerpt: 
       "Learn how to register, verify your email address and sign in to SmatPic.",
    readingTime: "3 min read",
    introduction:
      "Before you can create and manage a business workspace in SmatPic, you need a user account. Registration is completed through the public sign-up page.",
    steps: [
      {
        title: "Open the registration page",
        description:
          "Visit smatpic.com/register. Select the option to create an account if you are starting from the SmatPic homepage.",
      },
      {
        title: "Enter your personal details",
        description:
          "Provide your full name, email address and a password. Your password must contain at least 8 characters.",
      },
      {
        title: "Review and accept the required policies",
        description:
          "Tick all three checkboxes: Terms of Service, Privacy Policy and Acceptable Use Policy. You can open each policy using its link on the registration form.",
      },
      {
        title: "Create your account",
        description:
          "Select Create account. SmatPic will submit your details and create your user account if the information is valid and the email address is not already registered.",
      },
      {
        title: "Check your email",
        description:
            "SmatPic sends an email verification message to the address you registered with. Open the email and follow the verification link to confirm your email address. The verification link expires after 24 hours. Check your spam or junk folder if you cannot find the message.",
      },
      {
        title: "Sign in to your account",
        description:
          "After successfully verifying your email address, visit smatpic.com/login and sign in using your registered email address and password. Once signed in, you can proceed to create or access your business workspace.",
      },
    ],
    tip:
     "If you do not receive the verification email, check your spam or junk folder. If your verification link expires, use the resend verification option on the login page if available. If your email is already registered, return to the login page instead of registering again.",
  },
  {
    slug: "set-up-your-first-business",
    title: "Set up your first business",
    category: "Business setup",
    excerpt:
      "Follow the business setup process, choose your business type, configure regional settings and create your first workspace.",
    readingTime: "6 min read",
    introduction:
      "Once you have registered and signed in, SmatPic guides you through creating your first business workspace. This setup establishes the business identity and its initial operating location and inventory location.",
    steps: [
      {
        title: "Open Business Setup",
        description:
          "After signing in, open the business setup page. You can also visit smatpic.com/setup while signed in. Users who already have an active business membership are redirected to their dashboard.",
      },
      {
        title: "Enter your business name",
        description:
          "Enter the name your business operates under. This name identifies your business workspace in SmatPic.",
      },
      {
        title: "Choose your business type",
        description:
          "Select the business type that best describes your operations. Available options include restaurant, bar, wines and spirits, hotel, hospital or clinic, supermarket, shop, boutique, pharmacy and other business.",
      },
      {
        title: "Configure your regional settings",
        description:
          "Select your country, base currency, language and time zone. Selecting a country automatically updates the suggested currency, language and time zone. Review these values and change them if necessary.",
      },
      {
        title: "Configure your tax settings",
        description:
          "Review the tax configuration presented in the setup form. Enter the applicable details for your business and ensure the tax rate and pricing treatment reflect your business requirements.",
      },
      {
        title: "Set up your initial branch",
        description:
          "Provide the name and code for your first branch. The form may suggest a branch name based on your business name. Review it and use a code that your team can easily recognise.",
      },
      {
        title: "Set up your initial warehouse",
        description:
          "Provide the name and code for your initial warehouse or inventory location. This is created as part of your business foundation.",
      },
      {
        title: "Submit your business setup",
        description:
          "Review the information and submit the form. SmatPic validates the required details, creates the business and its initial branch and warehouse, assigns the business owner role and creates the default accounting accounts.",
      },
      {
        title: "Open your dashboard",
        description:
          "After successful creation and activation of the new business, SmatPic redirects you to the dashboard. Your business workspace is now ready for the next configuration and operational steps.",
      },
    ],
    tip:
      "Choose your base currency carefully. It is the business's primary reporting currency. Review the country, currency and time zone before submitting the setup form.",
  },
  
    {
    slug: "accept-business-invitation",
    title: "Accept a business invitation",
    category: "Getting started",
    excerpt:
      "Learn how to join an existing SmatPic business workspace using an invitation sent to your email address.",
    readingTime: "4 min read",
    introduction:
      "A business owner or authorised administrator can invite you to join an existing SmatPic business workspace. The invitation assigns you a role that determines your access to the business. You must sign in using the email address to which the invitation was sent.",
    steps: [
      {
        title: "Open your invitation link",
        description:
          "Open the invitation link shared with you by the business administrator. SmatPic displays the business name, invited email address, assigned role and invitation expiry date.",
      },
      {
        title: "Sign in or create your account",
        description:
          "If you already have a SmatPic account, select I already have an account and sign in. If you are new to SmatPic, select Create account and complete the registration and email verification process. Return to your invitation link after completing registration.",
      },
      {
        title: "Use the invited email address",
        description:
          "Sign in using the exact email address to which the invitation was sent. SmatPic checks that your authenticated account matches the invited email address. If you are signed in with another email address, sign out and sign in using the invited account.",
      },
      {
        title: "Review updated legal documents if prompted",
        description:
          "If SmatPic requires you to accept updated legal documents, you will be redirected to the legal review page. Review the documents and complete the required acceptance before returning to the invitation process.",
      },
      {
        title: "Accept the invitation",
        description:
          "Once your account matches the invitation, the invitation page confirms that you can accept it. Select Accept invitation to join the business workspace.",
      },
      {
        title: "Access your business workspace",
        description:
          "After successful acceptance, SmatPic creates or reactivates your business membership, assigns the invited role and redirects you to the dashboard. Your available features and permissions depend on the role assigned to you.",
      },
    ],
    tip:
      "Invitation links expire after seven days. An invitation can only be accepted once. If your link has expired or is no longer valid, contact the business administrator and request a new invitation. Do not forward your invitation link to another person because it is intended for the invited email address.",
  },
  
      {
      slug: "manage-business-users-and-invitations",
      title: "Manage business users and invitations",
      category: "Business setup",
      excerpt:
        "Learn how to invite people to your business, manage invitations and view users assigned to your workspace.",
      readingTime: "5 min read",
      introduction:
        "SmatPic allows authorised business users to invite team members into a business workspace. Each invitation is associated with an email address and a business role, which determines the permissions available to the invited user. User and invitation management is scoped to the currently selected business.",
      steps: [
        {
          title: "Open the Users page",
          description:
            "Sign in to SmatPic, select the business you want to manage and navigate to Settings > Users. The page displays users assigned to the selected business and invitations associated with that business.",
        },
        {
          title: "Start a new invitation",
          description:
            "Select Invite User. Enter the person's full name, email address and the business role you want to assign. Choose from the available roles, such as Administrator, Manager or Staff.",
        },
        {
          title: "Create and share the invitation link",
          description:
            "Submit the invitation form. SmatPic generates a secure invitation link and displays it on the screen. Select Copy invitation link and share it with the intended user. Creating an invitation generates a shareable link; it does not automatically email the recipient.",
        },
        {
          title: "Understand business roles",
          description:
            "The selected role determines the permissions available to the invited user. The standard business roles include Business Owner, Administrator, Manager and Staff. The Business Owner role cannot be assigned through the invitation process.",
        },
        {
          title: "Monitor invitation status",
          description:
            "Return to Settings > Users and review the Invitations section. Invitations are labelled Pending, Accepted or Expired. The section also displays the invited email address, assigned role and expiry date.",
        },
        {
          title: "Resend a pending invitation",
          description:
            "If a person has not accepted an invitation, select Resend on the pending invitation. SmatPic sends an invitation email and generates a refreshed invitation link with a new expiry period.",
        },
        {
          title: "Revoke an invitation",
          description:
            "If an invitation is no longer needed, select Revoke on the pending invitation. Resend and revoke controls are available for invitations that have not been accepted and have not expired.",
        },
        {
          title: "Review business users",
          description:
            "The Business Users section lists people assigned to the selected business. You can review their names, email addresses, active or inactive status, owner designation and assigned roles.",
        },
      ],
      tip:
        "Invitation links expire after seven days. Share each link only with the intended recipient because it is associated with a specific email address. If an invitation expires, contact an authorised business administrator to arrange a new invitation.",
    },

       {
         slug: "understand-business-roles-and-permissions",
         title: "Understanding business roles and permissions",
         category: "Business setup",
         excerpt:
           "Understand the default SmatPic business roles, how permissions work and why users may have different levels of access.",
         readingTime: "5 min read",
         introduction:
           "SmatPic uses role-based access control to determine what users can view and manage within a business workspace. Each business role contains a set of permissions that controls access to operational features and administrative functions. A user's access depends on their active membership and the roles assigned to them in the selected business.",
         steps: [
           {
             title: "Understand the Business Owner role",
             description:
               "The Business Owner has full access to the business and its settings. The owner is granted full permissions and is protected from deactivation through the standard business user management operation.",
           },
           {
             title: "Understand the Administrator role",
             description:
               "The Administrator has broad administrative access. Its default permissions include business access and updates, user management, role management, audit access, inventory, purchases, sales, payments, expenses and accounting management. It also includes specialised Pharmacy permissions.",
           },
           {
             title: "Understand the Manager role",
             description:
               "The Manager has operational management access. Its default permissions cover business access, inventory, purchases, sales, payments, expenses and accounting. It also includes specialised Pharmacy permissions.",
           },
           {
             title: "Understand the Staff role",
             description:
               "The Staff role provides standard operational access. Its default permissions include viewing business information, viewing inventory, viewing sales and managing sales operations.",
           },
           {
             title: "Understand how permissions are checked",
             description:
               "SmatPic first checks that you have an active membership in an active business. It then checks the permissions attached to your roles within that business. If you do not have the required permission, access to the requested operation is denied.",
           },
           {
             title: "Understand users with multiple roles",
             description:
               "A user can receive permissions from multiple roles assigned within the same business. SmatPic evaluates all those roles together. If any assigned role grants the required permission, the user can perform that operation.",
           },
           {
             title: "Understand business-specific access",
             description:
               "Roles and permissions are associated with a particular business. Having access to one business does not automatically grant the same access to another business. Your membership and assigned roles determine what you can do in the currently selected workspace.",
           },
           {
             title: "Request additional access",
             description:
               "If you cannot access a feature required for your work, contact the business owner or an authorised administrator. Explain which business feature you need and why you need it so they can review your access.",
           },
         ],
         tip:
           "The standard roles provide predefined permission sets. The current Settings > Users interface allows administrators to select a role when inviting someone and view assigned roles, but does not expose controls for editing role permissions or changing an existing user's assigned roles.",
       },
	   
	   {
       slug: "manage-business-settings",
       title: "Manage business settings",
       category: "Business setup",
       excerpt:
         "Learn how to configure business tax settings, check exchange rates and change your preferred display language.",
       readingTime: "5 min read",
       introduction:
         "SmatPic provides settings for configuring business tax, checking currency exchange rates and selecting your preferred application language. Some settings apply to the current business, while language is stored as a browser preference.",
       steps: [
         {
           title: "Open business settings",
           description:
             "Sign in to SmatPic and select the business you want to manage. Open Settings and choose the relevant configuration area.",
         },
         {
           title: "Configure business tax",
           description:
             "Open Settings > Tax to view and update the tax configuration for your business. You can enable or disable tax, enter a tax name such as VAT, and specify a tax rate between 0% and 100%.",
         },
         {
           title: "Choose the tax pricing mode",
           description:
             "Select Exclusive if tax should be calculated and added to the taxable selling amount. Select Inclusive if tax is already included in the selling price and should be extracted from that price. Review the current configuration before saving.",
         },
         {
           title: "Save your tax configuration",
           description:
             "Select the save button to apply your changes. SmatPic validates the tax name and percentage before saving the configuration. Successful changes are recorded in the business audit trail.",
         },
         {
           title: "Check currency exchange rates",
           description:
             "Open Settings > Currency to access the Exchange rates page. Select the source and destination currencies, then choose Get exchange rate. The page displays the exchange rate, its source and its effective date.",
         },
         {
           title: "Understand exchange rate updates",
           description:
             "SmatPic retrieves exchange rates from its configured provider and stores retrieved rates for the business. A previously retrieved rate may be reused for up to 60 minutes before a fresh quote is requested.",
         },
         {
           title: "Select your application language",
           description:
             "Use the language selector in the application layout to choose a supported language. The available languages are English, French and Amharic. English is the default language.",
         },
         {
           title: "Understand language preferences",
           description:
             "Your selected language is stored in a browser cookie for one year. This is a language preference for your application session and is separate from the business's base currency and tax configuration.",
         },
       ],
       tip:
         "The Exchange rates page is for checking currency conversion rates. It does not change your business's configured base currency. Tax settings apply to the selected business, so review the active business before making changes.",
     },
	 
	 {
  slug: "understanding-warehouses-and-stock-locations",
  title: "Understanding Warehouses and Stock Locations",
  category: "Business setup",
  excerpt: "Learn how SmatPic creates your initial branch and warehouse and how warehouses are used to track stock across business operations.",
  readingTime: "4 min read",
  introduction:
    "Warehouses are used to identify where your business stock is held. SmatPic creates an initial branch and warehouse when you set up a business. You then select the relevant warehouse when carrying out stock and operational activities.",
  steps: [
    {
      title: "Understand your initial branch",
      description:
        "During business setup, SmatPic creates an initial branch using the branch name you provide. If you use the suggested default, the branch name follows the format '[Business Name] Main Branch' and its code is MAIN."
    },
    {
      title: "Understand your initial warehouse",
      description:
        "SmatPic also creates an initial warehouse during business setup. The suggested default is Main Store for restaurants, bars, wines and spirits businesses, and boutiques. Other business types use Main Warehouse. The default warehouse code is MAIN. You can provide a different warehouse name and code during setup."
    },
    {
      title: "Understand the branch and warehouse relationship",
      description:
        "A warehouse is associated with a branch. This relationship allows stock locations to be linked to the relevant branch in the business structure."
    },
    {
      title: "Select a warehouse when receiving stock",
      description:
        "When receiving purchased stock or recording stock adjustments, select the warehouse where the stock should be recorded. This helps maintain accurate stock quantities by location."
    },
    {
      title: "Use warehouses in sales and POS",
      description:
        "Warehouse selection is also used in sales and POS workflows. The selected warehouse provides the stock location associated with the transaction."
    },
    {
      title: "Transfer stock between warehouses",
      description:
        "When transferring stock, select the source warehouse and destination warehouse. The source and destination must be different. This records the movement between the two stock locations."
    },
    {
      title: "View stock by warehouse",
      description:
        "Inventory views and reports can show stock balances, stock valuation, and stock movements by warehouse. Use these views to understand where stock is held."
    }
  ],
  tip: "Choose a clear warehouse name during initial business setup. Select the correct warehouse when receiving stock, making adjustments, processing sales, or transferring stock. The warehouse list includes active warehouses for the selected business. Contact your business administrator if you need a warehouse or branch added or changed.",
},

{
  slug: "understanding-inventory-and-stock-management",
  title: "Understanding Inventory and Stock Management",
  category: "Getting started",
  excerpt: "Learn how to receive stock, adjust inventory, transfer products between warehouses, and monitor stock levels and valuation.",
  readingTime: "5 min read",
  introduction:
    "SmatPic provides inventory tools for tracking product quantities across warehouses. You can record incoming stock, correct inventory balances, transfer stock between locations, and monitor low-stock alerts and stock valuation.",
  steps: [
    {
      title: "Understand your inventory dashboard",
      description:
        "The inventory dashboard provides an overview of stock quantities, low-stock products, out-of-stock products, and inventory valuation. The total units indicator counts discrete inventory units and excludes liquid inventory. Stock valuation is calculated using quantity multiplied by average cost and displayed separately by currency."
    },
    {
      title: "Understand low-stock alerts",
      description:
        "SmatPic compares the total quantity of each product across its active warehouse balances against its stock threshold. The reorder level takes precedence when configured; otherwise, the minimum stock level is used. Products with zero or less stock are classified as out of stock. Products above zero but at or below their threshold are classified as low stock."
    },
    {
      title: "Receive stock into a warehouse",
      description:
        "Open Inventory and select Receive Stock. Choose the product and destination warehouse, enter the received quantity and unit cost, and optionally add notes. The currency is taken from the selected product. The quantity must be greater than zero and the unit cost cannot be negative. Submitting the receipt increases the warehouse stock balance and updates average cost."
    },
    {
      title: "Enter additional details for liquid products",
      description:
        "When receiving liquid inventory, provide the container type, container capacity, and unit of measurement. SmatPic records individual sealed containers. The inventory quantity is calculated from the number of containers multiplied by the capacity of each container."
    },
    {
      title: "Receive pharmacy products",
      description:
        "Pharmacy products require additional batch information when receiving stock. The pharmacy product must be active, and you must provide a batch number and future expiry date. A manufacturing date is optional, but when entered it must be valid, cannot be in the future, and must be earlier than the expiry date."
    },
    {
      title: "Adjust stock quantities",
      description:
        "Use Adjust Stock when you need to correct a recorded inventory quantity. Select the product and warehouse, enter a positive or negative adjustment quantity, and provide a reason in the notes field. An adjustment cannot be zero or reduce the warehouse balance below zero. Standard inventory adjustments cannot be used for pharmacy products; use the pharmacy batch adjustment workflow instead."
    },
    {
      title: "Transfer stock between warehouses",
      description:
        "Use Transfer Stock to move inventory between two warehouses belonging to your business. Select the product, source warehouse, destination warehouse, and quantity. The source and destination must be different, and the source must have sufficient stock. SmatPic deducts the quantity from the source and adds it to the destination, recording both movements."
    },
    {
      title: "Transfer liquid inventory",
      description:
        "For liquid products, select the available containers from the source warehouse instead of entering an ordinary transfer quantity. SmatPic lists eligible sealed or open containers that have remaining stock. A container cannot be selected more than once, and all selected containers must still be available in the source warehouse."
    },
    {
      title: "Understand inventory movement records",
      description:
        "Stock operations create inventory movement records. Receipts are recorded as RECEIPT, adjustments as ADJUSTMENT, and warehouse transfers as TRANSFER_OUT and TRANSFER_IN. These records help maintain a history of inventory changes and movements."
    }
  ],
  tip:
    "Always select the correct warehouse when receiving, adjusting, or transferring stock. Provide a clear adjustment reason and verify the source and destination before submitting a transfer. For pharmacy products, use the dedicated batch workflows."
},


{
  slug: "managing-products-and-product-categories",
  title: "Managing Products and Product Categories",
  category: "Product management",
  excerpt:
    "Learn how to add, configure, search, edit, archive, and restore products in your SmatPic catalogue.",
  readingTime: "5 min read",
  introduction:
    "The product catalogue is where you maintain the products and services available to your business. You can create catalogue entries, configure prices and inventory settings, organise products using available categories, and archive entries that are no longer active.",
  steps: [
    {
      title: "Open the product catalogue",
      description:
        "Navigate to Inventory → Products. The catalogue provides an overview of your products and services, including the total catalogue count, active entries, stock-tracked products, and inactive entries."
    },
    {
      title: "Add a new product or service",
      description:
        "Select Add Product. Enter the product or service name and choose the appropriate type. The availability of the Service option depends on your business configuration. Complete the relevant product details, including description, unit, category, cost price, selling price, and currency."
    },
    {
      title: "Select a product category",
      description:
        "Where categories are available, select the appropriate parent category. If that category has subcategories, you can select a subcategory as well. The selected category helps organise the catalogue and may determine the prefix used when SmatPic generates a product SKU."
    },
    {
      title: "Understand SKU and barcode generation",
      description:
        "SmatPic automatically generates a business-specific SKU when a new product is created. The SKU prefix is based on the selected category where applicable; products without a category use the default PRD prefix. You can also provide a barcode, or allow SmatPic to generate one when it is omitted."
    },
    {
      title: "Configure pricing and inventory tracking",
      description:
        "Enter the product's cost price and selling price, using the appropriate currency. Where inventory tracking applies, configure the minimum stock and reorder level. You can also configure the product's unit and other available product attributes. Cost price, selling price, minimum stock, and reorder level cannot be negative."
    },
    {
      title: "Configure specialised inventory options",
      description:
        "Some business types support additional product configuration. For example, liquid inventory uses millilitres as its base unit and requires inventory tracking and a positive container volume. Other business types may expose additional attributes or selling-unit options depending on their configuration."
    },
    {
      title: "Search and manage catalogue entries",
      description:
        "Use the search field on the product catalogue to find entries. Open a product to view its details and use the available editing controls to update supported product information. Changes are subject to validation, including SKU uniqueness within the business and valid pricing and stock settings."
    },
    {
      title: "Archive products you no longer use",
      description:
        "You can select products and archive them from the active catalogue. Archived products are removed from active inventory and POS availability, but their SKU, barcode, and historical records are preserved. Archiving is not permanent deletion."
    },
    {
      title: "View and restore archived products",
      description:
        "Open the archived products page to view archived entries, including their names, SKUs, barcodes, and status. Use the available restore action to return a product to the active catalogue. Its original SKU and barcode are retained."
    },
    {
      title: "Manage boutique service categories",
      description:
        "For boutique businesses, the Services → Categories area provides category management. You can add a category with a name and optional description, edit existing category details, and activate or deactivate categories. These controls belong to the boutique services workflow and should not be assumed to be available as a universal product-category management screen for every business type."
    }
  ],
  tip:
    "Use clear product names, consistent units, and accurate prices. Review inventory tracking settings before saving a product. Archive entries rather than treating archiving as permanent deletion, especially when you need to preserve historical records."
},


{
  slug: "processing-sales-with-the-smatpic-pos",
  title: "Processing Sales with the SmatPic POS",
  category: "Sales and POS",
  excerpt:
    "Learn how to create a sale, add products, apply discounts, accept payments, and print customer receipts using the SmatPic POS.",
  readingTime: "6 min read",
  introduction:
    "The SmatPic Point of Sale (POS) allows you to process customer sales from your business workspace. You can select products, choose selling units, apply discounts, calculate tax, record payments, and generate receipts. The POS also updates inventory and accounting when a sale is completed.",
  steps: [
    {
      title: "Open the POS and select a warehouse",
      description:
        "Navigate to POS from your business workspace. The POS loads the available warehouses for the selected business and automatically selects the first available warehouse. Confirm that the correct warehouse is selected before adding products, because the sale will use stock from that location."
    },
    {
      title: "Find and add products to the sale",
      description:
        "Use the product search field to find products available for sale. Select a product to add it to the cart. Where a product has configured selling units, you can select the appropriate unit. SmatPic converts the selected selling quantity into its corresponding inventory quantity when processing the sale."
    },
    {
      title: "Check product availability",
      description:
        "For inventory-tracked products, SmatPic checks the available stock before allowing the item to be added or its quantity increased. You cannot add a tracked product with no available stock or request more than the available quantity. Restaurant menu items follow a separate recipe-based ingredient consumption workflow."
    },
    {
      title: "Handle pharmacy prescription products",
      description:
        "For pharmacy businesses, prescription and controlled products require an eligible prescription before they can be added to the cart. The prescription must belong to the current business and match the customer and product. It must be active or partially dispensed, not expired, and have sufficient remaining quantity. Over-the-counter products cannot be attached to a prescription through this workflow."
    },
    {
      title: "Review the cart and select a customer",
      description:
        "Review the items added to the cart and adjust quantities or remove items where necessary. You can associate the sale with an existing customer. Customer selection is required when recording a credit payment. For other payment methods, a customer is optional."
    },
    {
      title: "Apply a discount and review tax",
      description:
        "Enter a discount amount where applicable. The discount cannot exceed the cart subtotal. SmatPic calculates the tax and final sale total using the business tax configuration, including the configured tax name, rate, and inclusive or exclusive pricing mode. The final tax calculation is performed by the server using the saved business configuration."
    },
    {
      title: "Choose a payment method",
      description:
        "Select the appropriate payment method: Cash, M-Pesa, Card, Bank, or Credit. The payment details required depend on the selected method. Check the amount and any required customer or transaction details before submitting the checkout."
    },
    {
      title: "Record a cash payment",
      description:
        "For cash payments, enter the amount received from the customer. If the customer pays more than the sale total, SmatPic calculates the change due. The completed sale records the cash payment and displays the payment and change information on the receipt."
    },
    {
      title: "Process an M-Pesa payment",
      description:
        "Select M-Pesa and enter the customer's phone number. SmatPic initiates an STK Push for the sale amount. The customer must authorise the payment on their phone. The checkout initially remains pending while SmatPic waits for confirmation from Safaricom. An initiated STK Push is not proof that the sale has been paid or completed."
    },
    {
      title: "Understand pending M-Pesa payments",
      description:
        "SmatPic checks the payment status while the M-Pesa request is being processed. If the payment remains pending, the system may continue checking and attempt reconciliation for a delayed provider callback. If it is still pending after the polling period, you will be advised to check the payment status before retrying. Do not assume that a timed-out request has failed or immediately create another payment. A confirmed successful payment allows the sale to proceed to completion; a failed payment is reported as not completed."
    },
    {
      title: "Record Card, Bank, or Credit payments",
      description:
        "For Card payments, provide the card authorisation or transaction reference. For Bank payments, enter the bank transaction reference. For Credit payments, select the customer whose credit account is being used. Ensure the payment details are correct before completing the checkout."
    },
    {
      title: "Understand what happens when a sale is completed",
      description:
        "For Cash, Card, Bank, and Credit, SmatPic processes the sale, stock consumption, accounting entries, and payment record within the checkout transaction before marking the sale as completed. For M-Pesa, the sale remains in draft while payment confirmation is pending. After successful provider confirmation, the platform completes the inventory and accounting operations and records the final payment."
    },
    {
      title: "Print and keep the customer receipt",
      description:
        "After a sale is completed, SmatPic retrieves and displays the receipt. Use Print Receipt to print a customer copy. The receipt includes the business name, receipt number, date, warehouse, customer details where available, purchased items, quantities, prices, discounts, tax, total, payment method, payment amount, and transaction reference where available. It also displays the total amount paid and any change due."
    },
    {
      title: "What to do if checkout reports an error",
      description:
        "If a normal checkout fails, review the displayed error and correct the issue before trying again. If an M-Pesa request was initiated, check its payment status before attempting another checkout. If payment is confirmed but the receipt cannot be loaded, the sale may already have been completed; do not assume that the payment failed simply because the receipt was unavailable."
    }
  ],
  tip:
    "Always verify the selected warehouse, cart quantities, discount, tax, and final total before checkout. For M-Pesa, wait for confirmation and check the payment status before retrying a delayed request. Keep the completed receipt for your business records."
},


{
  slug: "managing-customers",
  title: "Managing Customers",
  category: "Customer management",
  excerpt:
    "Learn how to create customer records, update contact details, configure credit limits, manage customer status, and review sales history.",
  readingTime: "5 min read",
  introduction:
    "The Customers area in SmatPic helps you maintain customer records and associate sales with the right customers. You can store contact and tax information, configure an optional credit limit and currency, review recorded sales, and activate or deactivate customer records.",
  steps: [
    {
      title: "Open the Customers area",
      description:
        "Navigate to Customers from your business workspace. The Customers dashboard displays your customer records and an overview of total customers, active customers, customers with recorded sales, and inactive customers. These figures help you understand the current state of your customer records."
    },
    {
      title: "Create a customer record",
      description:
        "Select Add Customer to open the customer creation form. Enter the customer's name, which is required. You can also provide a phone number, email address, physical address, and tax number. These additional contact and identification fields are optional."
    },
    {
      title: "Configure the customer's credit information",
      description:
        "The Credit Settings section allows you to enter an optional credit limit and select a currency. A credit limit cannot be negative. Choose the appropriate currency from the available currency list. These fields record the customer's configured credit settings; they should not be treated as a live credit balance or an automatic credit approval."
    },
    {
      title: "Save the customer record",
      description:
        "Review the information and select Create Customer. SmatPic validates the required customer name and credit limit before saving. Newly created customers are active by default. After successful creation, you are returned to the Customers list."
    },
    {
      title: "Review the customer list",
      description:
        "The customer records table displays each customer's name, tax number where available, contact information, number of recorded sales, credit limit, and active or inactive status. Select a customer's name to open their details. If no customer records exist, the page provides an option to create the first customer."
    },
    {
      title: "View an individual customer profile",
      description:
        "Open a customer record to view their status, tax number, phone, email, address, and other saved details. The profile also displays the number of recorded sales, the total value of completed sales, the configured credit limit, and the date and reference of the last completed sale."
    },
    {
      title: "Review customer sales history",
      description:
        "The customer profile includes sales recorded against that customer. The sales history displays the sale reference, date, status, and total amount. Select a sale reference to open its sales details. The completed sales value shown in the customer overview is calculated from sales marked COMPLETED."
    },
    {
      title: "Edit customer information",
      description:
        "From the customer profile, select Edit Customer. You can update the customer's name, phone number, email address, physical address, tax number, credit limit, and currency. You can also change the customer's active status. Save your changes to return to the customer list."
    },
    {
      title: "Activate or deactivate a customer",
      description:
        "When editing a customer, use the Customer Status control to mark the record as active or inactive. Deactivation changes the customer's status without deleting the customer record or its associated sales history. You can reactivate the record later by editing it and enabling the Active setting."
    },
    {
      title: "Understand customer access permissions",
      description:
        "Viewing the customer list, profiles, and sales history requires the sales.read permission. Creating, editing, and changing customer status requires sales.manage permission. If you cannot access a customer operation, ask your business administrator to review your assigned role and permissions."
    }
  ],
  tip:
    "Use consistent customer names and accurate contact details to make records easier to identify. Set a credit limit only when it reflects your business's approved customer-credit arrangement. Deactivate records that should no longer be used instead of assuming that deactivation deletes their history."
},

{
  slug: "managing-sales-payments-and-returns",
  title: "Managing Sales, Payments and Returns",
  category: "Sales and POS",
  excerpt:
    "Learn how to record sales, review transaction details, collect payments, track outstanding balances, cancel or reverse sales, and process customer returns.",
  readingTime: "6 min read",
  introduction:
    "The Sales area in SmatPic provides a central place to record and review business transactions. You can create sales, monitor their status, record customer payments, track outstanding balances, and process returns for completed transactions. Each sale has a detailed record containing its items, financial breakdown, payment history, and available actions.",
  steps: [
    {
      title: "Open the Sales area",
      description:
        "Navigate to Sales from your business workspace. The Sales dashboard provides an overview of recorded transactions, including total transactions, completed sales, pending sales, reversed sales, and items sold. Revenue is presented separately by currency. The sales register lists recent transactions, showing each sale's reference number, item count, total value, and status. Select a sale reference to open its details."
    },
    {
      title: "Record a new sale",
      description:
        "Select Record Sale or the option to create a new sale. Choose the warehouse from which the items will be sold. The sale currency is inherited from your business's configured base currency. Add the products or available restaurant menu items, enter quantities, and select an applicable selling unit where available. You can also scan a product barcode to look up an inventory product. If the product is already in the sale, scanning it again increases its quantity."
    },
    {
      title: "Review sale items and totals",
      description:
        "Review the items, quantities, unit prices, and calculated line totals. You can adjust quantities and remove items before saving. Enter a discount if applicable; the discount cannot exceed the sale subtotal. Applicable business tax settings are used to calculate tax. You can also add optional notes to the sale. Review the subtotal, discount, tax, and final total before submitting."
    },
    {
      title: "Save and open the sale record",
      description:
        "Submit the sale to create its transaction record. A newly recorded sale is initially saved with DRAFT status and PENDING payment status. You are redirected to the sale details page, where you can review the sale reference, items, quantities, prices, subtotal, discount, tax, and total. A draft sale has not yet completed its inventory and accounting completion process."
    },
    {
      title: "Complete or cancel a draft sale",
      description:
        "A draft sale can be completed or cancelled from its details page. Completing the sale triggers the transaction's completion process, including inventory consumption, accounting entries, and the relevant completion checks. The selected warehouse is required. If a payment attempt is still pending or the sale has an outstanding balance associated with an existing payment attempt, completion may be blocked until the payment situation is resolved. A completed sale cannot be changed back to draft or cancelled; use the reversal process when a completed transaction needs to be reversed."
    },
    {
      title: "Understand sale statuses",
      description:
        "DRAFT means the sale has been recorded but has not completed its final processing. COMPLETED means the sale has passed its completion process. CANCELLED means a draft sale was cancelled. REVERSED means a previously completed sale has been reversed. The sales dashboard also groups transactions into completed, pending, and reversed figures. Pending sales are transactions that are not completed, cancelled, or reversed. Sale status and payment status are separate: a completed sale may still have an outstanding payment balance."
    },
    {
      title: "Record a payment against a sale",
      description:
        "Open the sale details page and locate the payments section. If the sale has an outstanding balance, use the payment form to record a payment. The supported payment methods in this form are Cash, M-Pesa, Card, and Bank. Enter the payment amount and optional notes. The amount must be greater than zero and cannot exceed the outstanding balance for non-cash payment methods. Cash payments can exceed the outstanding balance, allowing the transaction to account for change."
    },
    {
      title: "Understand M-Pesa payments",
      description:
        "When recording an M-Pesa payment, provide the customer's phone number and initiate the payment request. The customer receives an STK Push prompt on their phone and must complete the payment. SmatPic uses the M-Pesa confirmation process to establish whether the payment succeeded. A request being initiated does not by itself mean that payment has been received. If confirmation is delayed, check the payment status before attempting another payment to avoid duplicate requests."
    },
    {
      title: "Review payment status and outstanding balances",
      description:
        "The sale details page displays the total amount paid and the outstanding balance. Payment status is tracked separately from sale status. PENDING indicates that payment is not yet settled, PARTIAL indicates that some but not all of the sale has been paid, and PAID indicates that the recorded payments cover the sale total. Payment records show their reference, method, date, currency, and amount. Multiple payments can be recorded against a sale until its balance is settled."
    },
    {
      title: "Reverse a completed sale",
      description:
        "If a completed sale needs to be reversed, open its details page and select the Reverse Sale action. Reversal is available for completed sales, not as a replacement for cancelling a draft. The reversal process handles the applicable inventory, accounting, and related transaction records. A successfully reversed sale is marked REVERSED. Use this action carefully because it changes the transaction's financial and inventory records."
    },
    {
      title: "Process a customer return",
      description:
        "For a completed sale, locate the Returns section on its details page. Select the quantities being returned for the relevant items. You can enter a return reason and optional notes. SmatPic calculates the return subtotal, proportional discount, tax, and refund total using the original sale values. Only completed sales can be returned, and the return currency must match the original sale currency."
    },
    {
      title: "Understand return quantity and refund limits",
      description:
        "You cannot return more than the quantity originally sold. SmatPic also checks previous completed returns to ensure that the combined returned quantity does not exceed the original quantity. Where payments have been recorded, the return amount cannot exceed the amount already paid on the sale. Once submitted successfully, the return receives a generated reference number beginning with RET and is recorded as completed."
    },
    {
      title: "Understand stock and accounting adjustments for returns",
      description:
        "Returned inventory products are restored to the warehouse associated with the original sale. The return also creates the corresponding accounting entries for returned sales revenue, applicable tax, and the reduction in customer receivables. The return's accounting and inventory changes are processed as part of the return transaction."
    },
    {
      title: "Understand refund recording",
      description:
        "SmatPic allocates the return value against the original sale's recorded payments and creates the corresponding payment-reversal accounting entries. The sale's payment status is updated to REFUNDED when the remaining recorded paid amount is fully reversed, or PARTIAL when some paid amount remains. This is an in-platform payment and accounting adjustment. It does not automatically send money back through M-Pesa, a bank, or a card provider. If the customer must receive money externally, arrange that repayment through the appropriate payment channel separately."
    },
    {
      title: "Understand sales permissions",
      description:
        "Viewing sales records and payment history requires the sales.read permission. Creating sales, completing draft sales, cancelling draft sales, and reversing completed sales require sales.manage. Recording sale payments requires payments.manage. Processing a return also requires the appropriate sales management access. If an action is unavailable, ask your business administrator to review your assigned role and permissions."
    }
  ],
  tip:
    "Always verify the sale reference, warehouse, items, quantities, discounts, tax, and final total before completing a transaction. Check payment confirmation before retrying a delayed M-Pesa request. For returns, verify the quantities and calculated refund total before submission. Remember that an in-platform refund adjustment does not itself transfer money back to the customer."
},

{
  slug: "managing-purchases-and-supplier-payments",
  title: "Managing Purchases and Supplier Payments",
  category: "Purchasing and Suppliers",
  excerpt:
    "Learn how to create supplier records, prepare and receive purchases, manage pharmacy batches, and record supplier payments.",
  readingTime: "6 min read",
  introduction:
    "The Purchases area in SmatPic helps you manage stock procurement from suppliers. You can maintain supplier records, create purchase drafts, order purchases, receive stock into a warehouse, and record payments against outstanding purchase balances. Purchase receiving and supplier payments are separate processes: receiving a purchase updates inventory, while recording payments updates the purchase's payment status and accounting records.",
  steps: [
    {
      title: "Open the Suppliers area",
      description:
        "Navigate to Suppliers from your business workspace. The supplier dashboard displays the total number of suppliers, active suppliers, suppliers with email addresses, and suppliers with configured payment terms. The supplier register lists supplier names, tax numbers where available, phone numbers, email addresses, currencies, payment terms, and active or inactive status."
    },
    {
      title: "Create a supplier record",
      description:
        "Select Add Supplier to open the supplier creation form. Enter the supplier's name, which is required. You can also provide a phone number, email address, physical address, tax number, payment terms in days, and a currency. These additional fields are optional. If payment terms are not configured, the supplier register displays Immediate. Review the details and submit the form to create the supplier record."
    },
    {
      title: "Open the Purchases area",
      description:
        "Navigate to Purchases to view the purchase register. The dashboard groups purchase records into All Purchases, Draft, Ordered, Received, and Cancelled. The workflow moves from preparing a draft, to ordering it, and then receiving the stock. Select a purchase reference or its View Details action to open the individual purchase record."
    },
    {
      title: "Create a purchase draft",
      description:
        "Select the option to record a new purchase. Choose an active supplier and add the products being purchased. The purchase form supports inventory-tracked products of type PRODUCT. Enter a positive quantity and a non-negative unit cost for each item. You can also provide a receiving warehouse, supplier invoice number, currency, and optional notes. The currency defaults to your business's base currency. Review the subtotal, any purchase-level discount, applicable tax, and total before selecting Save Draft."
    },
    {
      title: "Understand purchase quantities and costs",
      description:
        "Purchase quantities can include fractional values, up to four decimal places. For liquid products configured with a volume attribute, the form displays the resulting inventory quantity calculated from the purchase quantity multiplied by the product volume. The purchase discount is applied at purchase level and allocated proportionally across the items when stock is received. Unit costs cannot be negative."
    },
    {
      title: "Order a purchase",
      description:
        "Open a purchase with DRAFT status and select Order Purchase when you are ready to place the order with the supplier. The purchase status changes to ORDERED. An ordered purchase is awaiting delivery and can be received or cancelled. You cannot order a purchase that has already been received or cancelled."
    },
    {
      title: "Receive a purchase into inventory",
      description:
        "Open an ORDERED purchase and select Receive Purchase. A receiving warehouse is required. For standard inventory products, SmatPic records the stock receipt, updates the warehouse inventory balance, and recalculates the average cost. The purchase status changes to RECEIVED. Receiving is a distinct step from creating or ordering the purchase; saving a draft does not add stock to inventory."
    },
    {
      title: "Receive pharmacy products with batch details",
      description:
        "Pharmacy products require batch information during receiving. Enter a batch number, expiry date, and quantity for each batch. You can add multiple batches for a purchase item. The allocated quantities for each pharmacy purchase item must equal the purchased quantity exactly. Batch numbers must not be duplicated for the same pharmacy product, expiry dates must be in the future, and quantities must be positive. Manufacturing dates are optional; when provided, they cannot be in the future or on or after the expiry date. Batch unit cost must match the purchase item's unit cost. SmatPic creates pharmacy batch records linked to the product, warehouse, supplier, purchase, and purchase item."
    },
    {
      title: "Understand purchase statuses",
      description:
        "DRAFT means the purchase has been created but not yet ordered. ORDERED means it has been placed with the supplier and is awaiting delivery. RECEIVED means the stock has been received and the inventory receipt processed. CANCELLED means the purchase was cancelled before receiving. Only DRAFT and ORDERED purchases can be cancelled. A received purchase cannot be cancelled through the standard purchase workflow."
    },
    {
      title: "Record a supplier payment",
      description:
        "Open the purchase details page and review the payment information. The page displays the total paid amount and outstanding balance. When an outstanding balance remains, use the Record Payment form to enter a payment amount and select the payment method presented in the form. You can also enter optional notes. The amount must be greater than zero and cannot exceed the outstanding purchase balance. Submit the payment to record it against the purchase."
    },
    {
      title: "Understand partial and completed payments",
      description:
        "You can record multiple payments against a purchase while an outstanding balance remains. SmatPic calculates the cumulative amount paid and updates the purchase payment status. PENDING means no payment has been recorded, PARTIAL means the recorded payments cover only part of the purchase total, and PAID means the recorded payments cover the full purchase total. Payment status is separate from purchase status: a purchase can be RECEIVED while still having an outstanding supplier balance."
    },
    {
      title: "Review purchase payment history",
      description:
        "The purchase details page includes the recorded payment history. Review the payment references, methods, amounts, statuses, and dates shown there, together with the total paid and outstanding balance. Each successfully recorded purchase payment is saved against the current business and purchase and generates the corresponding accounting entries."
    },
    {
      title: "Understand purchase permissions",
      description:
        "Viewing the purchase register, purchase details, supplier records, and purchase payment history requires purchases.read. Creating suppliers, creating purchases, ordering, receiving, cancelling, and recording purchase payments require purchases.manage and active subscription operation access. If an action is unavailable, ask your business administrator to review your assigned role and permissions."
    }
  ],
  tip:
    "Keep supplier details accurate and include the supplier invoice number when available. Check the supplier, products, quantities, unit costs, warehouse, discount, tax, and total before ordering. Remember that stock is added when an ordered purchase is received, not when its draft is saved. For pharmacy purchases, verify every batch number, quantity, expiry date, and unit cost. Track supplier payments separately from stock receiving and review the outstanding balance before recording another payment."
},

{
  slug: "managing-expenses",
  title: "Managing Expenses",
  category: "Expenses and Accounting",
  excerpt:
    "Learn how to record business expenses, review expense summaries, and update payment statuses.",
  readingTime: "5 min read",
  introduction:
    "SmatPic allows you to record business expenses, monitor spending by category, and track whether expenses are unpaid, partially paid, or paid. Expenses are automatically posted to the accounting ledger when created.",
  steps: [
    {
      title: "Open the Expenses section",
      description:
        "Navigate to Expenses from your business workspace. The expense register provides an overview of recorded expenses, payment statuses, spending totals, and the largest expense categories. Select Record Expense to enter a new expense.",
    },
    {
      title: "Enter the expense details",
      description:
        "Complete the expense form. Select an expense category, enter a description, specify the amount, and choose the expense date. The date defaults to the current date. SmatPic uses your business's configured base currency automatically.",
    },
    {
      title: "Set the initial payment status",
      description:
        "Choose Unpaid, Partially Paid, or Paid. New expenses default to Unpaid. This field records the payment status for tracking purposes; selecting Partially Paid or Paid does not itself record a payment or transfer funds.",
    },
    {
      title: "Add notes and save",
      description:
        "You can add optional notes to provide additional information about the expense. Review the details and submit the form. SmatPic generates an expense reference beginning with EXP. Once successfully saved, you are returned to the expense register.",
    },
    {
      title: "Understand the expense dashboard",
      description:
        "The expense dashboard displays total expenses, paid expenses, partially paid expenses, and outstanding expenses. It also presents spending by category and a payment-status breakdown. The register lists each expense's reference, category, description, expense date, amount, payment status, and a link to its details.",
    },
    {
      title: "View an expense",
      description:
        "Select View Details beside an expense to open its detail page. You can review its reference, description, category, amount, currency, expense date, creation date, notes, and current payment status.",
    },
    {
      title: "Update the payment status",
      description:
        "On the expense detail page, use the Payment Status dropdown to change the status to Unpaid, Partially Paid, or Paid. SmatPic saves the status update and refreshes the page. Changes are recorded in the business audit trail. Updating this field does not create a payment transaction or automatically settle the accounting payable.",
    },
    {
      title: "Understand the accounting entry",
      description:
        "When an expense is created, SmatPic automatically posts a journal entry. The Operating Expenses account (5000) is debited and Accounts Payable (2000) is credited for the expense amount. This records the expense and the corresponding payable in the accounting ledger.",
    },
  ],
  tip:
    "Keep expense payment statuses accurate. Remember that changing a status to Paid is an administrative update, not a recorded payment transaction. The expense register and accounting payable should be reconciled against actual payments.",
},

{
  slug: "understanding-accounting",
  title: "Understanding Accounting",
  category: "Expenses and Accounting",
  excerpt:
    "Understand your chart of accounts, journal entries, financial overview, Profit & Loss report, and Cash Flow report.",
  readingTime: "7 min read",
  introduction:
    "The Accounting area in SmatPic helps you organize financial records and review your business's financial position. It includes a chart of accounts, journal entries, a financial overview, a Profit & Loss report, and a Cash Flow report. Financial figures are calculated from posted accounting journal entries.",
  steps: [
    {
      title: "Open the Accounting dashboard",
      description:
        "Navigate to Accounting from your business workspace. The dashboard provides a financial overview and displays your configured chart of accounts. Access requires the accounting.read permission.",
    },
    {
      title: "Initialize your chart of accounts",
      description:
        "If your business has no accounts configured, select Initialize Accounts on the Accounting dashboard. SmatPic creates the default system accounts for your business. Existing accounts with matching business account codes are retained rather than duplicated. Initializing accounts requires accounting.manage permission and active subscription operation access.",
    },
    {
      title: "Understand the default accounts",
      description:
        "SmatPic initializes accounts for Cash (1000), M-Pesa (1010), Card Payments (1020), Bank (1030), Inventory (1100), Accounts Receivable (1200), Input VAT (1205), Accounts Payable (2000), Tax Payable (2100), Sales Revenue (4000), and Operating Expenses (5000). These accounts organize business assets, liabilities, revenue, and expenses.",
    },
    {
      title: "Review the financial overview",
      description:
        "The Accounting dashboard displays Revenue, Expenses, Profit, Cash Position, Receivables, and Payables. These figures are calculated from posted journal entries. Revenue is calculated from revenue account credits less debits. Expenses are calculated from expense account debits less credits. Profit is revenue minus expenses. Receivables use account 1200, payables use account 2000, and cash position uses the net movement on account 1000.",
    },
    {
      title: "Understand the chart of accounts",
      description:
        "The chart of accounts lists the accounts configured for your business. Each row displays the account code, account name, description where available, account type, and whether it is a system or custom account. The inspected Accounting dashboard provides a view of these accounts and an option to initialize the default accounts; it does not expose individual account editing or deletion controls.",
    },
    {
      title: "Review journal entries",
      description:
        "Open Journal Entries to review posted financial transactions. The journal register displays the reference, description, entry date, total debits, total credits, and status. Debit and credit totals are calculated from the entry's journal lines. Financial transactions generated by business workflows appear here as accounting entries are posted.",
    },
    {
      title: "Understand balanced journal entries",
      description:
        "SmatPic validates journal entries before creating them. Each entry must contain at least two lines, and total debits must equal total credits. Each line must reference an account, debit and credit amounts cannot be negative, and a single line cannot contain both a debit and a credit amount.",
    },
    {
      title: "Review the Profit & Loss report",
      description:
        "Open Accounting Reports and select Profit & Loss. The report displays Revenue, Expenses, and Net Profit. It includes active revenue and expense accounts and journal lines belonging to POSTED entries. Revenue is calculated as credits minus debits, expenses as debits minus credits, and net profit as revenue minus expenses. The current report does not expose date-range filters.",
    },
    {
      title: "Review the Cash Flow report",
      description:
        "Open Accounting Reports and select Cash Flow. The report displays Cash In, Cash Out, and Net Movement, together with up to ten recent cash-account transactions. The current calculation uses the Cash account with code 1000. Cash In is the total of posted debit entries on that account, Cash Out is the total of posted credit entries, and Net Movement is Cash In minus Cash Out.",
    },
    {
      title: "Understand accounting report limitations",
      description:
        "The current Profit & Loss and Cash Flow reports are simplified summaries. They do not expose date-range filters or currency conversion in the inspected implementation. The Cash Flow report is based on the Cash account rather than a full classification of operating, investing, and financing activities. Review the underlying financial records and relevant currency information when interpreting the figures.",
    },
    {
      title: "Understand accounting permissions",
      description:
        "Viewing the Accounting dashboard, chart of accounts, journal entries, Profit & Loss, and Cash Flow requires accounting.read. Initializing default accounts and using the journal creation server action require accounting.manage and active subscription operation access. By default, Business Owners have full access, Administrators and Managers have accounting.read and accounting.manage, while Staff do not receive these permissions. Your assigned business role determines your access.",
    },
  ],
  tip:
    "Review posted journal entries regularly and ensure the underlying business transactions are accurate. Remember that the Cash Position dashboard metric represents net movement on Cash account 1000, not necessarily a reconciled bank balance. The current financial reports do not provide date filters or automatic currency conversion.",
},

 {
    slug: "managing-business-reports",
    title: "Managing Business Reports",
    category: "Expenses and Accounting",
    excerpt:
      "Learn how to review business performance, sales, purchases, expenses, inventory, pharmacy reports, and hospital financial summaries.",
    readingTime: "8 min read",
    introduction:
      "The Reports area in SmatPic provides an overview of business performance and financial and inventory information. The reports available depend on your business type. Standard reports summarize completed sales, received purchases, recorded expenses, current inventory, and tax figures. Pharmacy businesses also have specialist batch and dispensing reports, while hospital businesses have a financial summary with date-range filters.",
    steps: [
      {
        title: "Open Reports",
        description:
          "From your business workspace, select Reports in the main navigation. The Reports entry is available across the currently supported business types. The information displayed is scoped to the active business.",
      },
      {
        title: "Review the business performance overview",
        description:
          "The standard Reports page presents revenue, purchases, expenses, and an estimated profit. Revenue is calculated from completed sales, while purchases are based on received purchases. Expenses include recorded business expenses. The page also shows the number of completed sales, received purchases, and recorded expenses.",
      },
      {
        title: "Understand the inventory and tax summaries",
        description:
          "The inventory summary displays the current stock quantity and inventory value. The tax summary displays taxable sales, tax collected, and total sales. The tax figures account for completed sales and completed returns. These summaries reflect the data available to the reporting service for your active business.",
      },
      {
        title: "Understand the estimated profit figure",
        description:
          "The standard reporting estimate is calculated as completed sales revenue minus received purchase costs minus recorded expenses. It is a reporting estimate, not an accounting net-profit statement. For formal financial reporting, review the Accounting area and its posted journal entries and financial reports.",
      },
      {
        title: "Review Advanced Reporting",
        description:
          "Advanced Reporting provides additional business performance indicators, including revenue, profit estimate, estimated profit margin, purchase intensity, expense intensity, and inventory exposure. Purchase intensity compares received purchase costs with revenue. Expense intensity compares recorded expenses with revenue. Inventory exposure displays current stock value, units, and inventory value relative to revenue. Advanced Reporting requires the Professional plan or higher and is included in the trial entitlement.",
      },
      {
        title: "Interpret Advanced Reporting carefully",
        description:
          "Advanced Reporting uses the current reporting position. Its profit estimate is revenue minus received purchases minus recorded expenses; it is not an accounting net-profit statement. Inventory value relative to revenue is a reporting ratio only. It does not represent inventory turnover or working-capital efficiency.",
      },
      {
        title: "Review pharmacy dispensing reports",
        description:
          "Pharmacy businesses have additional reports for controlled medicine dispensing and prescription dispensing. The Controlled Medicine Register records dispensing references, sale references, dates, medicine and batch details, quantities, prescription information, customer, pharmacist, licence, and status. The Prescription Dispensing Report displays prescription and expiry dates, product and customer details, prescriber information, prescribed, dispensed and remaining quantities, sale reference, and status.",
      },
      {
        title: "Review pharmacy batch reports",
        description:
          "Pharmacy businesses also have Batch Expiry, Batch Movement, Stock Valuation by Batch, and Batch Recall reports. The Batch Expiry Report shows batches with remaining stock, their expiry information, quantities, costs, stock value, warehouse, supplier, and status. The Batch Movement Report shows pharmacy batch adjustment movements, including movement date, product, warehouse, movement type, quantity, cost, reference, user, and notes. It is specifically a batch adjustment report, not a register of every stock movement.",
      },
      {
        title: "Understand pharmacy stock valuation and recalls",
        description:
          "Stock Valuation by Batch displays remaining units and stock value for each batch, together with product, expiry, unit cost, warehouse, supplier, and batch status. The Batch Recall Report lists recalled batches with product and batch details, manufacturing and expiry dates, received and remaining quantities, stock value, warehouse, supplier, recall reason, and displayed recall date. The expiry and valuation reports include batches with remaining quantities greater than zero. Recalled batches are identified in the relevant report status.",
      },
      {
        title: "Open the hospital financial summary",
        description:
          "For a hospital business, the Reports page displays the Hospital Financial Summary workspace. The same workspace is also available under Settings in Hospital Reports. Access requires the hospital.invoices.read permission and a hospital business context.",
      },
      {
        title: "Choose a hospital reporting period",
        description:
          "The hospital financial summary initially uses the first day of the current month through today. Use the start and end date fields to select another reporting period, then apply the filters or refresh the report. The start date must not be later than the end date. The report groups monetary amounts by currency rather than adding different currencies together.",
      },
      {
        title: "Understand the hospital financial summary",
        description:
          "The hospital report displays invoice value, recorded collections, outstanding balances, and overdue balances. Invoice totals by status are grouped by currency and include invoice count, subtotal, discounts, tax, total, and paid amount. Collections show payment count and amount by currency. The invoice totals use invoice creation dates within the selected period, while collections use payment creation dates within that period.",
      },
      {
        title: "Review outstanding and overdue hospital invoices",
        description:
          "The outstanding invoice list includes invoices currently in Issued or Partially Paid status and displays invoice reference, patient, status, due date, total, paid amount, and balance. This list is not restricted to invoices created during the selected reporting period. The overdue list identifies outstanding invoices with a due date earlier than the selected report end date. The balance due is calculated as the invoice total minus the amount paid, with negative balances shown as zero.",
      },
    ],
    tip:
      "Check the reporting period and business context before interpreting figures. Standard and Advanced Reporting use completed sales, received purchases, recorded expenses, and current inventory data. Hospital reports group amounts by currency and use different date bases for invoice totals and collections. Treat the standard and advanced profit figures as estimates, not substitutes for posted accounting reports.",
  },
  
];

export function getSupportArticle(slug: string) {
  return supportArticles.find((article) => article.slug === slug);
}

export const supportCategories = [
  {
    name: "Getting started",
    description: "Create your account and get started with SmatPic.",
    icon: "rocket",
  },
  {
    name: "Business setup",
    description: "Create your business workspace and configure its foundation.",
    icon: "building",
  },
  
  {
    name: "Product management",
    description: "Create, configure, organise, and manage your product catalogue.",
    icon: "package",
  },
  
  
  {
    name: "Sales and POS",
    description: "Process customer sales, accept payments, and manage POS receipts.",
    icon: "shopping-cart",
  },
  
  
  {
    name: "Customer management",
    description: "Create customer records, manage customer information, and review sales history.",
    icon: "users",
  },
  
  {
    name: "Purchasing and Suppliers",
    description:
      "Manage supplier records, purchase orders, stock receiving, and supplier payments.",
    icon: "truck",
  },
  
    {
    name: "Expenses and Accounting",
    description:
      "Record business expenses, monitor spending, and understand expense accounting.",
    icon: "wallet",
  },



];
