import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'rw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.welcome': 'Welcome',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.view': 'View',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.login_required': 'Login Required',
    'auth.login_to_add_cart': 'Please login to add items to cart',
    'auth.forgot_password': 'Forgot Password?',
    'auth.remember_me': 'Remember me',
    'auth.dont_have_account': "Don't have an account?",
    'auth.already_have_account': 'Already have an account?',
    'auth.sign_up': 'Sign up',
    'auth.sign_in': 'Sign in',
    
    // Products
    'products.search_placeholder': 'Search for products...',
    'products.no_products_available': 'No products available at the moment.',
    'products.view_more': 'View More',
    'products.loading_related': 'Loading related products...',
    'products.you_might_like': 'You might also like',
    'products.add_to_cart': 'Add to Cart',
    'products.out_of_stock': 'Out of Stock',
    'products.in_stock': 'In Stock',
    
    // Cart
    'cart.added_to_cart': 'Added to cart',
    'cart.item_added': '{{item}} has been added to your cart.',
    'cart.failed_to_add': 'Failed to add to cart',
    'cart.add_to_cart': 'Add to Cart',
    'cart.adding': 'Adding...',
    
    // Categories - FIXED MISSING TRANSLATIONS
    'categories.loading': 'Loading categories...',
    'categories.no_categories': 'No categories available.',
    'categories.browse_categories': 'BROWSE BY CATEGORIES',
    'categories.discover_products': 'Discover our wide range of products organized by category',
    'categories.view_all': 'View All Categories',
    
    // Home
    'home.new_arrivals': 'NEW ARRIVALS',
    'home.top_selling': 'TOP SELLING',
    'home.browse_categories': 'Browse by Category',
    
    // Hero Section
    'hero.title': 'Welcome to A Smart Marketplace for Women Entrepreneurs in Rwanda',
    'hero.description': 'Built for women entrepreneurs in Kigali, WomXchange Rwanda provides a seamless online platform for selling, managing, and expanding your business.',
    'hero.shop_now': 'Shop Now',
    'hero.image_alt': 'Successful woman entrepreneur',
    
    // Footer
    'footer.company_name': 'WomXchange Rwanda',
    'footer.company_description': 'Empowering women entrepreneurs across Rwanda with a smart marketplace platform.',
    'footer.location': 'Kigali, Rwanda',
    'footer.quick_links': 'Quick Links',
    'footer.support': 'Support',
    'footer.help_center': 'Help Center',
    'footer.shipping_info': 'Shipping Info',
    'footer.returns': 'Returns',
    'footer.privacy_policy': 'Privacy Policy',
    'footer.terms_of_service': 'Terms of Service',
    'footer.location_title': 'Location',
    'footer.location_description': 'Visit our office in Kigali or shop online from anywhere in Rwanda.',
    'footer.store_hours': 'Store Hours',
    'footer.weekdays': 'Mon - Fri: 9:00 AM - 9:00 PM',
    'footer.weekends': 'Sat - Sun: 10:00 AM - 9:00 PM',
    'footer.copyright': '© 2024 WomXchange. All rights reserved women entrepreneurs.',
    
    // Testimonials
    'testimonials.title': 'OUR HAPPY CUSTOMERS',
    'testimonials.review_1': 'Amazing quality products and fast delivery. I love supporting local women entrepreneurs!',
    'testimonials.review_2': 'The cosmetics I bought are incredible. Great prices and authentic products from talented women.',
    'testimonials.review_3': 'This marketplace changed my shopping experience. So many unique items and great customer service!',
    'testimonials.review_4': 'Excellent customer service and high quality products. Will definitely shop here again!',
    'testimonials.review_5': 'Love the variety of products available. Supporting local businesses has never been easier!',
    
    // Banner
    'banner.sell_on_system': 'Sell on Our System',
    'banner.join_as_seller': 'Join as a Seller',
    
    // Dashboard
    'dashboard.notifications': 'No notifications',
    'dashboard.profile': 'Profile',
    'dashboard.settings': 'Settings',
    
    // Error Pages
    'error.404.title': '404 - Page Not Found',
    'error.404.message': 'The page you are looking for does not exist.',
    'error.404.return_home': 'Return to Home',
    'error.failed_load_products': 'Failed to load products',
    
    // Language
    'language.english': 'English',
    'language.kinyarwanda': 'Kinyarwanda',
    
    // Admin Pages
    'admin.customers': 'Customers',
    'admin.vendors': 'Vendors',
    'admin.products': 'Products',
    'admin.orders': 'Orders',
    'admin.reports': 'Reports',
    'admin.analytics': 'Analytics',
    'admin.community_chat': 'Community Chat',
    'admin.management': 'Management',
    'admin.sidebar.dashboard': 'Dashboard',
    'admin.sidebar.customers': 'Customers',
    'admin.sidebar.vendors': 'Vendors',
    'admin.sidebar.products': 'Products',
    'admin.sidebar.orders': 'Orders',
    'admin.sidebar.reports': 'Reports',
    'admin.sidebar.analytics': 'Analytics',
    'admin.sidebar.profile': 'Profile',
    'admin.sidebar.settings': 'Settings',
    
    // Customer Management
    'customers.title': 'Customers Management',
    'customers.add_customer': 'Add Customer',
    'customers.search_customers': 'Search customers...',
    'customers.all_customers': 'All Customers',
    'customers.active': 'Active',
    'customers.inactive': 'Inactive',
    'customers.total_customers': 'Total Customers',
    'customers.customer': 'Customer',
    'customers.email': 'Email',
    'customers.joined': 'Joined',
    'customers.status': 'Status',
    'customers.actions': 'Actions',
    'customers.no_customers': 'No customers found',
    'customers.import': 'Import',
    'customers.export': 'Export',
    
    // Vendor Management
    'vendors.title': 'Vendors Management',
    'vendors.add_vendor': 'Add Vendor',
    'vendors.search_vendors': 'Search vendors...',
    'vendors.total_vendors': 'Total Vendors',
    'vendors.total_users': 'Total Users',
    'vendors.vendor': 'Vendor',
    'vendors.role': 'Role',
    'vendors.no_vendors': 'No vendors found',
    'vendors.active_sellers': 'Active SELLERs',
    'vendors.all_registered': 'All registered users',
    
    // Orders Management
    'orders.title': 'Orders Management',
    'orders.refresh': 'Refresh Orders',
    'orders.search_orders': 'Search orders...',
    'orders.total_orders': 'Total Orders',
    'orders.paid_orders': 'Paid Orders',
    'orders.pending_payment': 'Pending Payment',
    'orders.total_revenue': 'Total Revenue',
    'orders.order_id': 'Order ID',
    'orders.customer': 'Customer',
    'orders.total_price': 'Total Price',
    'orders.payment_status': 'Payment Status',
    'orders.delivery_status': 'Delivery Status',
    'orders.date': 'Date',
    'orders.actions': 'Actions',
    'orders.confirm_payment': 'Confirm Payment',
    'orders.mark_delivered': 'Mark Delivered',
    'orders.no_orders': 'No orders found',
    'orders.confirmed_by_admin': 'Confirmed by Admin',
    'orders.awaiting_admin': 'Awaiting Admin Confirmation',
    'orders.payment_code_generated': 'Payment Code Generated',
    'orders.pending_payment_status': 'Pending Payment',
    'orders.delivered': 'Delivered',
    'orders.not_delivered': 'Not Delivered',
    
    // User Pages
    'categories.title': 'Shop by Categories',
    'categories.description': 'Discover our wide range of product categories and find exactly what you\'re looking for.',
    'categories.no_categories_found': 'No Categories Found',
    'categories.categories_appear': 'Categories will appear here once they are added to the system.',
    
    // Products Page
    'products.title': 'Products',
    'products.filters': 'Filters',
    'products.search': 'Search',
    'products.category': 'Category',
    'products.price_range': 'Price Range',
    'products.clear_filters': 'Clear Filters',
    'products.showing_results': 'Showing {{count}} of {{total}} products',
    'products.no_products_matching': 'No products found matching your filters.',
    'products.previous': 'Previous',
    'products.next': 'Next',
    
    // Cart Page
    'cart.title': 'YOUR CART',
    'cart.empty': 'Your cart is empty',
    'cart.continue_shopping': 'Continue Shopping',
    'cart.order_summary': 'Order Summary',
    'cart.subtotal': 'Subtotal',
    'cart.discount': 'Discount (-20%)',
    'cart.delivery_fee': 'Delivery Fee',
    'cart.total': 'Total',
    'cart.go_to_checkout': 'Go to checkout',
    'cart.please_login': 'Please Login',
    'cart.login_to_view': 'You need to be logged in to view your cart.',
    'cart.loading': 'Loading cart...',
    
    // Checkout Page
    'checkout.title': 'Checkout',
    'checkout.billing_info': 'Billing Information',
    'checkout.full_name': 'Full Name',
    'checkout.email': 'Email',
    'checkout.phone': 'Phone Number',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.payment_method': 'Payment Method',
    'checkout.mobile_money': 'Mobile Money',
    'checkout.place_order': 'Place Order',
    'checkout.order_summary': 'Order Summary',
    
    // Order Complete Page
    'order_complete.title': 'Order Placed Successfully!',
    'order_complete.message': 'Your order has been received and is being processed.',
    'order_complete.order_id': 'Order ID: #{{id}}',
    'order_complete.payment_processing': 'Payment Processing',
    'order_complete.generate_code': 'Generate a payment code to proceed with MoMo payment',
    'order_complete.generate_payment_code': 'Generate Payment Code',
    'order_complete.payment_code': 'Your Payment Code:',
    'order_complete.use_code': 'Use this code to complete your MoMo payment, then confirm below',
    'order_complete.made_payment': 'I\'ve Made the Payment',
    'order_complete.awaiting_confirmation': 'Awaiting Admin Confirmation',
    'order_complete.payment_verification': 'Your payment is being verified by our admin team',
    'order_complete.view_orders': 'View My Orders',
    'order_complete.return_home': 'Return to Home Page',
    'order_complete.secured': 'Your purchases are secured by industry-standard encryption',
    'order_complete.order_id_not_found': 'Order ID not found',
    'order_complete.code_generated_success': 'Payment code generated successfully',
    'order_complete.failed_generate_code': 'Failed to generate payment code',
    'order_complete.payment_confirmed': 'Payment confirmed! Awaiting admin verification.',
    'order_complete.failed_confirm_payment': 'Failed to confirm payment',
    "title": "Products Management",
    "add_product": "Add Product",
    "edit_product": "Edit Product",
    "create_product": "Create New Product",
    "created": "Product created successfully.",
    "updated": "Product updated successfully.",
    "deleted": "Product deleted successfully.",
    "create_failed": "Failed to create product.",
    "update_failed": "Failed to update product.",
    "delete_failed": "Failed to delete product.",
    "load_error": "Failed to load products.",
    "confirm_delete": "Are you sure you want to delete this product?",
    "name": "Name",
    "description": "Description",
    "price": "Price (Rwf)",
    "stock": "Stock",
    "image": "Image URL",
    "category": "Category",
    "select_category": "Select a category",
    "create": "Create",
    "update": "Update",
    "search": "Search products...",
    "all": "All Products",
    "actions": "Actions",
    "no_products": "No products found",
    //Dashboard
    'dashboard.daily_sales': 'Daily Sales',
    'dashboard.daily_users': 'Daily user',
    'dashboard.summary_sales': 'Summary sales',
    'dashboard.chart_placeholder': 'Chart visualization area',
    'dashboard.upcoming_payments': 'Upcoming Payments',
    'dashboard.payment_data': 'Payment data',
    'dashboard.recent_orders': 'Recent Orders',
    'dashboard.id': 'Id',
    'dashboard.customer_name': 'Customer Name',
    'dashboard.product_name': 'Product Name',
    'dashboard.price': 'Price',
    'dashboard.picture': 'Picture',
    'dashboard.sample_product': 'Shirt',
    'dashboard.expense_status': 'Expense status',
    'dashboard.vendor_role': 'Vendor',
    'dashboard.retry': 'Retry',
  },
  rw: {
    // Navigation
    'nav.home': 'Ahabanza',
    'nav.products': 'Ibicuruzwa',
    'nav.categories': 'Amatsinda',
    'nav.about': 'Ibyerekeye',
    'nav.contact': 'Twandikire',
    'nav.dashboard': 'Ubuyobozi',
    
    // Common
    
    'common.loading': 'Birimo gutangura...',
    'common.error': 'Ikosa',
    'common.welcome': 'Murakaza neza',
    'common.save': 'Bika',
    'common.cancel': 'Kuraguza',
    'common.delete': 'Gusiba',
    'common.edit': 'Guhindura',
    'common.add': 'Kongeramo',
    'common.search': 'Gushaka',
    'common.filter': 'Gutoranya',
    'common.clear': 'Gusiba',
    'common.submit': 'Kohereza',
    'common.close': 'Gufunga',
    'common.open': 'Gufungura',
    'common.view': 'Kureba',
    
    // Authentication
    'auth.login': 'Kwinjira',
    'auth.register': 'Kwiyandikisha',
    'auth.logout': 'Gusohoka',
    'auth.email': 'Imeli',
    'auth.password': 'Ijambo ry\'ibanga',
    'auth.name': 'Izina',
    'auth.login_required': 'Ugomba Kwinjira',
    'auth.login_to_add_cart': 'Nyamuneka winjire kugira ngo wongeremo ibicuruzwa mu gitebo',
    'auth.forgot_password': 'Wibagiwe ijambo ry\'ibanga?',
    'auth.remember_me': 'Nyibuke',
    'auth.dont_have_account': 'Ntufite konti?',
    'auth.already_have_account': 'Usanzwe ufite konti?',
    'auth.sign_up': 'Iyandikishe',
    'auth.sign_in': 'Injira',
    
    // Products
    'products.search_placeholder': 'Shakisha ibicuruzwa...',
    'products.no_products_available': 'Nta bicuruzwa bihari ubu.',
    'products.view_more': 'Reba Byinshi',
    'products.loading_related': 'Birimo gutangura ibicuruzwa bifitaniye isano...',
    'products.you_might_like': 'Bishoboka ko ubishaka',
    'products.add_to_cart': 'Shyira mu Gitebo',
    'products.out_of_stock': 'Byarangiye',
    'products.in_stock': 'Birahari',
    
    // Cart
    'cart.added_to_cart': 'Byashyizwe mu gitebo',
    'cart.item_added': '{{item}} byashyizwe mu gitebo cyawe.',
    'cart.failed_to_add': 'Byanze gushyirwa mu gitebo',
    'cart.add_to_cart': 'Shyira mu Gitebo',
    'cart.adding': 'Birimo gushyirwa...',
    
    // Categories
    'categories.loading': 'Birimo gutangura amatsinda...',
    'categories.no_categories': 'Nta matsinda ahari.',
    'categories.browse_categories': 'SHAKISHA HAKURIKIJWE AMATSINDA',
    'categories.discover_products': 'Menya ibicuruzwa bitandukanye byateguwe hakurikijwe amatsinda',
    'categories.view_all': 'Reba Amatsinda Yose',
    
    // Home
    'home.new_arrivals': 'IBICURUZWA BISHYA',
    'home.top_selling': 'IBICURUZWA BICURUZA CYANE',
    'home.browse_categories': 'Shakisha hakurikijwe Itsinda',
    
    // Hero Section
    'hero.title': 'Murakaza neza ku Isoko Ryubwenge ry\'Abacuruzi b\'Abagore mu Rwanda',
    'hero.description': 'Ryubatswe kubacuruzi b\'abagore bo i Kigali, WomXchange Rwanda itanga urubuga rworoshye rwo gucuruza, gucunga, no kwagura ubucuruzi bwawe.',
    'hero.shop_now': 'Gura Ubu',
    'hero.image_alt': 'Umucuruzi w\'umugore watsindiye',
    
    // Footer
    'footer.company_name': 'WomXchange Rwanda',
    'footer.company_description': 'Gutera imbere abacuruzi b\'abagore bo mu Rwanda hakoreshejwe urubuga rw\'isoko ryubwenge.',
    'footer.location': 'Kigali, u Rwanda',
    'footer.quick_links': 'Ihuza Ryihuse',
    'footer.support': 'Ub ufasha',
    'footer.help_center': 'Ikigo cy\'Ubufasha',
    'footer.shipping_info': 'Amakuru y\'Iyohereza',
    'footer.returns': 'Iyasubizwa',
    'footer.privacy_policy': 'Politiki y\'Ibanga',
    'footer.terms_of_service': 'Amabwiriza y\'Inyago',
    'footer.location_title': 'Ahantu',
    'footer.location_description': 'Suranabire ibiro byacu i Kigali cyangwa ugure kumurongo uhereye ahantu hose mu Rwanda.',
    'footer.store_hours': 'Amasaha y\'Iduka',
    'footer.weekdays': 'Ku cyumweru - Kw\'igatanu: 9:00 AM - 9:00 PM',
    'footer.weekends': 'Ku cyomboro - Ku cyumweru: 10:00 AM - 9:00 PM',
    'footer.copyright': '© 2024 WomXchange. Uburenganzira bwose burarangiye. Byakozwe n\'urukundo kubacuruzi b\'abagore.',
    "title": "Iyoborwa ry'ibicuruzwa",
    "add_product": "Ongeraho Igicuruzwa",
    "edit_product": "Hindura Igicuruzwa",
    "create_product": "Hanga Igicuruzwa Gishya",
    "created": "Igicuruzwa cyoherejwe neza.",
    "updated": "Igicuruzwa gihinduwe neza.",
    "deleted": "Igicuruzwa cyasibwe neza.",
    "create_failed": "Kunanirwa guhanga igicuruzwa.",
    "update_failed": "Kunanirwa guhindura igicuruzwa.",
    "delete_failed": "Kunanirwa gusiba igicuruzwa.",
    "load_error": "Kunanirwa gupakurura ibicuruzwa.",
    "confirm_delete": "Urashaka koko gusiba iki gicuruzwa?",
    "name": "Izina",
    "description": "Ibisobanuro",
    "price": "Igiciro (Rwf)",
    "stock": "Ubwinshi",
    "image": "Ishusho ya URL",
    "category": "Icyiciro",
    "select_category": "Hitamo icyiciro",
    "create": "Hanga",
    "update": "Hindura",
    "search": "Shakisha ibicuruzwa...",
    "all": "Ibicuruzwa Byose",
    "actions": "Ibikorwa",
    "no_products": "Nta bicuruzwa bibonetse",
    // Testimonials
    'testimonials.title': 'ABAKIRIYA BACU BISHIMIYE',
    'testimonials.review_1': 'Ibicuruzwa byiza cyane kandi biboherezwa vuba. Ndakunda gushyigikira abacuruzi b\'aho!',
    'testimonials.review_2': 'Ibintu byo kwisiga naguze biratangaje. Ibiciro byiza kandi ibicuruzwa nyabyo kuva kumugore ufite ubuhanga.',
    'testimonials.review_3': 'Iri soko ryahinduye ubunyangamugayo bwanjye bwo kugura. Ibintu byinshi bidasanzwe kandi serivisi nziza!',
    'testimonials.review_4': 'Serivisi nziza y\'abakiriya n\'ibicuruzwa byujuje ibisabwa. Nzongera kugura hano!',
    'testimonials.review_5': 'Ndakunda ibicuruzwa bitandukanye birahari. Gushyigikira ubucuruzi bw\'aho ntabwo byigeze byoroshye!',
    
    // Banner
    'banner.sell_on_system': 'Gucuruzira kuri sisiteme yacu',
    'banner.join_as_seller': 'Winjire nk\'Umucuruzi',
    
    // Dashboard
    'dashboard.notifications': 'Nta makuru',
    'dashboard.profile': 'Umwirondoro',
    'dashboard.settings': 'Igenamiterere',
    
    // Error Pages
    'error.404.title': '404 - Urupapuro Rutabonetse',
    'error.404.message': 'Urupapuro ushaka ntirubaho.',
    'error.404.return_home': 'Subira Ahabanza',
    'error.failed_load_products': 'Byanze gutangura ibicuruzwa',
    
    // Language
    'language.english': 'Icyongereza',
    'language.kinyarwanda': 'Ikinyarwanda',
    
    // Admin Pages
    'admin.customers': 'Abakiriya',
    'admin.vendors': 'Abacuruzi',
    'admin.products': 'Ibicuruzwa',
    'admin.orders': 'Amateka',
    'admin.reports': 'Raporo',
    'admin.analytics': 'Isesengura',
    'admin.community_chat': 'Ikiganiro cy\'Umuryango',
    'admin.management': 'Ubuyobozi',
    'admin.sidebar.dashboard': 'Ubuyobozi',
    'admin.sidebar.customers': 'Abakiriya',
    'admin.sidebar.vendors': 'Abacuruzi',
    'admin.sidebar.products': 'Ibicuruzwa',
    'admin.sidebar.orders': 'Amateka',
    'admin.sidebar.reports': 'Raporo',
    'admin.sidebar.analytics': 'Isesengura',
    'admin.sidebar.profile': 'Umwirondoro',
    'admin.sidebar.settings': 'Igenamiterere',
    
    // Customer Management
    'customers.title': 'Ubuyobozi bw\'Abakiriya',
    'customers.add_customer': 'Kongeramo Umukiriya',
    'customers.search_customers': 'Shakisha abakiriya...',
    'customers.all_customers': 'Abakiriya Bose',
    'customers.active': 'Bakora',
    'customers.inactive': 'Ntibakora',
    'customers.total_customers': 'Abakiriya Bose',
    'customers.customer': 'Umukiriya',
    'customers.email': 'Imeli',
    'customers.joined': 'Yinjiye',
    'customers.status': 'Uko bimeze',
    'customers.actions': 'Ibikorwa',
    'customers.no_customers': 'Nta bakiriya babonetse',
    'customers.import': 'Kwinjiza',
    'customers.export': 'Gusohora',
    
    // Vendor Management
    'vendors.title': 'Ubuyobozi bw\'Abacuruzi',
    'vendors.add_vendor': 'Kongeramo Umucuruzi',
    'vendors.search_vendors': 'Shakisha abacuruzi...',
    'vendors.total_vendors': 'Abacuruzi Bose',
    'vendors.total_users': 'Abakoresha Bose',
    'vendors.vendor': 'Umucuruzi',
    'vendors.role': 'Uruhare',
    'vendors.no_vendors': 'Nta bacuruzi babonetse',
    'vendors.active_sellers': 'Abacuruzi Bakora',
    'vendors.all_registered': 'Abakoresha bose biyandikishije',
    
    // Orders Management
    'orders.title': 'Ubuyobozi bw\'Amateka',
    'orders.refresh': 'Vugurura Amateka',
    'orders.search_orders': 'Shakisha amateka...',
    'orders.total_orders': 'Amateka Yose',
    'orders.paid_orders': 'Amateka Yishyuwe',
    'orders.pending_payment': 'Bitegereje Kwishyura',
    'orders.total_revenue': 'Amafaranga Yose',
    'orders.order_id': 'Nimero y\'Iteka',
    'orders.customer': 'Umukiriya',
    'orders.total_price': 'Igiciro Cyose',
    'orders.payment_status': 'Uko Kwishyura Bimeze',
    'orders.delivery_status': 'Uko Gutanga Bimeze',
    'orders.date': 'Itariki',
    'orders.actions': 'Ibikorwa',
    'orders.confirm_payment': 'Emeza Kwishyura',
    'orders.mark_delivered': 'Shyira Nk\'Ibyatanzwe',
    'orders.no_orders': 'Nta mateka abonetse',
    'orders.confirmed_by_admin': 'Byemejwe n\'Umuyobozi',
    'orders.awaiting_admin': 'Bitegereje Umuyobozi',
    'orders.payment_code_generated': 'Kode y\'Kwishyura Yarakozwe',
    'orders.pending_payment_status': 'Bitegereje Kwishyura',
    'orders.delivered': 'Byatanzwe',
    'orders.not_delivered': 'Ntibyatanzwe',
    
    // User Pages
    'categories.title': 'Gura Hakurikijwe Amatsinda',
    'categories.description': 'Menya amatsinda menshi y\'ibicuruzwa kandi ubone ibyo ushaka neza.',
    'categories.no_categories_found': 'Nta matsinda Abonetse',
    'categories.categories_appear': 'Amatsinda azagaragara hano amaze kongerwa muri sisiteme.',
    
    // Products Page
    'products.title': 'Ibicuruzwa',
    'products.filters': 'Gutoranya',
    'products.search': 'Gushaka',
    'products.category': 'Itsinda',
    'products.price_range': 'Urwego rw\'Igiciro',
    'products.clear_filters': 'Gusiba Amatoranywa',
    'products.price': 'Ibiciro',
    'products.actions': 'ibikorwa',
    'products.name': 'izina',
    'products.image': 'Ifoto',
    'products.description': 'Ibisobanuro',
    'products.stock': 'Ubwinshi',
    'products.add_product': 'kongera igicuruzwa',
    'products.showing_results': 'Byerekana {{count}} muri {{total}} ibicuruzwa',
    'products.no_products_matching': 'Nta bicuruzwa bihuye n\'amatoranywa yawe.',
    'products.previous': 'Ibambere',
    'products.next': 'Ibikurikira',
    
    // Cart Page
    'cart.title': 'IGITEBO CYAWE',
    'cart.empty': 'Igitebo cyawe nticyfite kintu',
    'cart.continue_shopping': 'Komeza Kugura',
    'cart.order_summary': 'Incamake y\'Iteka',
    'cart.subtotal': 'Igiteranyo',
    'cart.discount': 'Kugabanuka (-20%)',
    'cart.delivery_fee': 'Amafaranga yo Gutanga',
    'cart.total': 'Byose',
    'cart.go_to_checkout': 'Jya kwishyura',
    'cart.please_login': 'Nyamuneka Winjire',
    'cart.login_to_view': 'Ugomba kwinjira kugira ngo urebe igitebo cyawe.',
    'cart.loading': 'Birimo gutangura igitebo...',
    
    // Checkout Page
    'checkout.title': 'Kwishyura',
    'checkout.billing_info': 'Amakuru yo Kwishyura',
    'checkout.full_name': 'Izina Ryuzuye',
    'checkout.email': 'Imeli',
    'checkout.phone': 'Nimero ya Telefoni',
    'checkout.address': 'Aderesi',
    'checkout.city': 'Umujyi',
    'checkout.payment_method': 'Uburyo bwo Kwishyura',
    'checkout.mobile_money': 'Mobile Money',
    'checkout.place_order': 'Shyira Iteka',
    'checkout.order_summary': 'Incamake y\'Iteka',
    
    // Order Complete Page
    'order_complete.title': 'Iteka Ryashyizwe Neza!',
    'order_complete.message': 'Iteka ryawe ryakiriye kandi ririmo gutunganywa.',
    'order_complete.order_id': 'Nimero y\'Iteka: #{{id}}',
    'order_complete.payment_processing': 'Gutunganya Kwishyura',
    'order_complete.generate_code': 'Kora kode yo kwishyura kugira ngo ukomeze na MoMo',
    'order_complete.generate_payment_code': 'Kora Kode yo Kwishyura',
    'order_complete.payment_code': 'Kode Yawe yo Kwishyura:',
    'order_complete.use_code': 'Koresha iyi kode kugira ngo urangize kwishyura kwa MoMo, hanyuma wemeze hepfo',
    'order_complete.made_payment': 'Narishyuye',
    'order_complete.awaiting_confirmation': 'Bitegereje Umuyobozi',
    'order_complete.payment_verification': 'Kwishyura kwawe birimo kwemezwa n\'itsinda ryacu ry\'ubuyobozi',
    'order_complete.view_orders': 'Reba Amateka Yanjye',
    'order_complete.return_home': 'Subira Ahabanza',
    'order_complete.secured': 'Ibyo wagize bifashwe n\'ubunyangamugayo bukomeye',
    'order_complete.order_id_not_found': 'Nimero y\'Iteka ntiyabonetse',
    'order_complete.code_generated_success': 'Kode yo kwishyura yakozwe neza',
    'order_complete.failed_generate_code': 'Byanze gukora kode yo kwishyura',
    'order_complete.payment_confirmed': 'Kwishyura byemejwe! Bitegereje kwemezwa n\'umuyobozi.',
    'order_complete.failed_confirm_payment': 'Byanze kwemeza kwishyura',
    
    //Dashboard
    'dashboard.daily_sales': 'Umuzingo wa buri munsi',
    'dashboard.daily_users': 'Uwakoresheje buri munsi',
    'dashboard.summary_sales': 'Incamake y\'umushinga',
    'dashboard.chart_placeholder': 'Ahantu ho kwerekana amashusho',
    'dashboard.upcoming_payments': 'Kwishyura kuri hafi',
    'dashboard.payment_data': 'Amakuru yo kwishyura',
    'dashboard.recent_orders': 'Amateka aheruka',
    'dashboard.id': 'nimero',
    'dashboard.customer_name': 'Izina ry\'umukiriya',
    'dashboard.product_name': 'Izina ry\'igicuruzwa',
    'dashboard.price': 'Igiciro',
    'dashboard.picture': 'Ifoto',
    'dashboard.sample_product': 'umwenda',
    'dashboard.expense_status': 'Imiterere y\'ikiguzi',
    'dashboard.vendor_role': 'Umucuruzi',
    'dashboard.retry': 'Gerageza',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, any>): string => {
    let translation = translations[language][key] || translations['en'][key] || key;
    
    // Fallback for missing translations
    if (translation === key) {
      console.warn(`Missing translation for key: ${key}`);
      // Return a readable version of the key
      return key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || key;
    }
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
