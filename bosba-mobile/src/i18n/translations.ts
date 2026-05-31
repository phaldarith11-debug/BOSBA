export type Locale = "en" | "km" | "ja" | "zh";

export const LOCALES: { locale: Locale; label: string; nativeName: string; flag: string }[] = [
  { locale: "en", label: "English",  nativeName: "English",   flag: "🇬🇧" },
  { locale: "km", label: "Khmer",    nativeName: "ភាសាខ្មែរ", flag: "🇰🇭" },
  { locale: "ja", label: "Japanese", nativeName: "日本語",     flag: "🇯🇵" },
  { locale: "zh", label: "Chinese",  nativeName: "中文",       flag: "🇨🇳" },
];

export type TranslationSchema = {
  nav: {
    home: string; products: string; cart: string; wishlist: string;
    orders: string; profile: string; login: string; logout: string;
    search: string;
  };
  home: {
    badge: string; heroTitle: string; heroHighlight: string;
    heroSubtitle: string; heroCta: string;
    categoriesTitle: string; featuredTitle: string; viewAll: string;
  };
  products: {
    title: string; found: string; inStock: string; outOfStock: string;
    onlyLeft: string; addToCart: string; addedToCart: string;
    description: string; related: string; freeDelivery: string;
    sortLatest: string; sortPriceAsc: string; sortPriceDesc: string;
    empty: string; emptyHint: string;
  };
  cart: {
    title: string; empty: string; emptyHint: string; emptyCta: string;
    subtotal: string; delivery: string; deliveryNote: string;
    total: string; checkout: string; continueShopping: string;
  };
  auth: {
    loginTitle: string; loginSubtitle: string; email: string;
    password: string; login: string; noAccount: string; register: string;
    registerTitle: string; name: string; phone: string; confirm: string;
    createAccount: string; hasAccount: string; signin: string;
    passwordMismatch: string; forgotPassword: string;
    sendReset: string; backToLogin: string;
    loginError: string; registerError: string;
  };
  order: {
    title: string; allOrders: string;
    statusPending: string; statusConfirmed: string; statusProcessing: string;
    statusShipped: string; statusDelivered: string; statusCancelled: string;
    items: string; paymentMethod: string; deliveryAddress: string;
  };
  profile: {
    title: string; editProfile: string; name: string; phone: string;
    save: string; signOut: string; signInPrompt: string; registerPrompt: string;
    orders: string; settings: string; language: string;
  };
  common: {
    loading: string; error: string; retry: string; cancel: string; save: string;
    close: string; confirm: string; delete: string; search: string;
  };
  checkout: {
    title: string; fullName: string; phoneLabel: string; province: string; deliveryAddress: string;
    selectProvince: string; city: string; commune: string; address: string; addressPlaceholder: string;
    deliveryZone: string; paymentMethod: string; couponPlaceholder: string;
    applyCoupon: string; notes: string; notesPlaceholder: string;
    orderSummary: string; subtotal: string; delivery: string; discount: string;
    total: string; placeOrder: string; placing: string; success: string; error: string;
  };
};

const en: TranslationSchema = {
  nav: {
    home: "Home", products: "Products", cart: "Cart", wishlist: "Wishlist",
    orders: "My Orders", profile: "Profile", login: "Login", logout: "Sign Out",
    search: "Search products...",
  },
  home: {
    badge: "Free delivery in Phnom Penh",
    heroTitle: "Shop Cambodia's", heroHighlight: "Best Products",
    heroSubtitle: "Pay in USD or KHR. ABA, ACLEDA, Wing & COD accepted.",
    heroCta: "Shop Now",
    categoriesTitle: "Shop by Category",
    featuredTitle: "Featured Products", viewAll: "View All",
  },
  products: {
    title: "All Products", found: "{count} products found",
    inStock: "In Stock", outOfStock: "Out of Stock", onlyLeft: "Only {count} left",
    addToCart: "Add to Cart", addedToCart: "Added to cart",
    description: "Description", related: "Related Products",
    freeDelivery: "Free delivery in Phnom Penh on orders over $20",
    sortLatest: "Latest", sortPriceAsc: "Price: Low to High", sortPriceDesc: "Price: High to Low",
    empty: "No products found", emptyHint: "Try adjusting your filters",
  },
  cart: {
    title: "Shopping Cart", empty: "Your cart is empty",
    emptyHint: "Browse our products and add something you like!",
    emptyCta: "Shop Now", subtotal: "Subtotal", delivery: "Delivery",
    deliveryNote: "Calculated at checkout", total: "Total",
    checkout: "Proceed to Checkout", continueShopping: "Continue Shopping",
  },
  auth: {
    loginTitle: "Welcome back", loginSubtitle: "Sign in to your account",
    email: "Email", password: "Password", login: "Sign In",
    noAccount: "Don't have an account?", register: "Register",
    registerTitle: "Create an account", name: "Full Name", phone: "Phone (Cambodia)",
    confirm: "Confirm Password", createAccount: "Create Account",
    hasAccount: "Already have an account?", signin: "Sign in",
    passwordMismatch: "Passwords do not match",
    forgotPassword: "Forgot password?", sendReset: "Send Reset Link",
    backToLogin: "Back to Login",
    loginError: "Invalid email or password",
    registerError: "Registration failed",
  },
  order: {
    title: "Order #{number}", allOrders: "All Orders",
    statusPending: "Pending", statusConfirmed: "Confirmed", statusProcessing: "Processing",
    statusShipped: "Shipped", statusDelivered: "Delivered", statusCancelled: "Cancelled",
    items: "Items", paymentMethod: "Payment Method", deliveryAddress: "Delivery Address",
  },
  profile: {
    title: "My Profile", editProfile: "Edit Profile", name: "Full Name",
    phone: "Phone", save: "Save Changes", signOut: "Sign Out",
    signInPrompt: "Sign in to your account", registerPrompt: "New here? Register",
    orders: "My Orders", settings: "Settings", language: "Language",
  },
  common: {
    loading: "Loading...", error: "Something went wrong", retry: "Retry",
    cancel: "Cancel", save: "Save", close: "Close", confirm: "Confirm",
    delete: "Delete", search: "Search",
  },
  checkout: {
    title: "Checkout", fullName: "Full Name", phoneLabel: "Phone (Cambodia)", deliveryAddress: "Delivery Address",
    province: "Province", selectProvince: "Select province",
    city: "City / District", commune: "Commune", address: "Address",
    addressPlaceholder: "Street, house number, village...",
    deliveryZone: "Delivery Zone", paymentMethod: "Payment Method",
    couponPlaceholder: "Coupon code", applyCoupon: "Apply",
    notes: "Order Notes (optional)", notesPlaceholder: "Special instructions...",
    orderSummary: "Order Summary", subtotal: "Subtotal", delivery: "Delivery",
    discount: "Discount", total: "Total",
    placeOrder: "Place Order", placing: "Placing Order...",
    success: "Order placed!", error: "Failed to place order",
  },
};

const km: TranslationSchema = {
  nav: {
    home: "ទំព័រដើម", products: "ផលិតផល", cart: "កន្ត្រក",
    wishlist: "បញ្ជីចូលចិត្ត", orders: "ការបញ្ជាទិញ", profile: "គណនី",
    login: "ចូលគណនី", logout: "ចាកចេញ", search: "ស្វែងរកផលិតផល...",
  },
  home: {
    badge: "ដឹកឥតគិតថ្លៃក្នុងភ្នំពេញ",
    heroTitle: "ទិញផលិតផល", heroHighlight: "ល្អបំផុតនៅកម្ពុជា",
    heroSubtitle: "ទូទាត់ជា USD ឬ KHR ។ ទទួលយក ABA, ACLEDA, Wing, COD",
    heroCta: "ទិញឥឡូវ",
    categoriesTitle: "ទិញតាមប្រភេទ",
    featuredTitle: "ផលិតផលពិសេស", viewAll: "មើលទាំងអស់",
  },
  products: {
    title: "ផលិតផលទាំងអស់", found: "រកឃើញ {count} ផលិតផល",
    inStock: "មានស្តុក", outOfStock: "អស់ស្តុក", onlyLeft: "នៅសល់ {count} ទៀត",
    addToCart: "បន្ថែមទៅកន្ត្រក", addedToCart: "បានបន្ថែម",
    description: "ការពិពណ៌នា", related: "ផលិតផលពាក់ព័ន្ធ",
    freeDelivery: "ដឹកឥតគិតថ្លៃក្នុងភ្នំពេញ លើ $20",
    sortLatest: "ថ្មីបំផុត", sortPriceAsc: "តម្លៃ: ទាបទៅខ្ពស់",
    sortPriceDesc: "តម្លៃ: ខ្ពស់ទៅទាប",
    empty: "រកមិនឃើញផលិតផល", emptyHint: "សាកល្បងប្ដូរការតម្រង",
  },
  cart: {
    title: "កន្ត្រករបស់ខ្ញុំ", empty: "កន្ត្រករបស់អ្នកទទេ",
    emptyHint: "រកមើលផលិតផលហើយបន្ថែម!", emptyCta: "ទិញឥឡូវ",
    subtotal: "តម្លៃសរុបរង", delivery: "ការដឹក",
    deliveryNote: "គណនានៅការទូទាត់", total: "សរុប",
    checkout: "បន្តទៅការទូទាត់", continueShopping: "បន្តទិញ",
  },
  auth: {
    loginTitle: "សូមស្វាគមន៍មកវិញ", loginSubtitle: "ចូលទៅក្នុងគណនី",
    email: "អ៊ីមែល", password: "ពាក្យសម្ងាត់", login: "ចូលគណនី",
    noAccount: "មិនមានគណនីទេ?", register: "ចុះឈ្មោះ",
    registerTitle: "បង្កើតគណនី", name: "ឈ្មោះពេញ", phone: "ទូរស័ព្ទ",
    confirm: "បញ្ជាក់ពាក្យសម្ងាត់", createAccount: "បង្កើតគណនី",
    hasAccount: "មានគណនីរួចហើយ?", signin: "ចូលគណនី",
    passwordMismatch: "ពាក្យសម្ងាត់មិនត្រូវគ្នា",
    forgotPassword: "ភ្លេចពាក្យសម្ងាត់?", sendReset: "ផ្ញើតំណភ្ជាប់",
    backToLogin: "ត្រឡប់ចូល",
    loginError: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
    registerError: "ការចុះឈ្មោះបរាជ័យ",
  },
  order: {
    title: "ការបញ្ជាទិញ #{number}", allOrders: "ការបញ្ជាទិញទាំងអស់",
    statusPending: "កំពុងរង់ចាំ", statusConfirmed: "បានបញ្ជាក់",
    statusProcessing: "កំពុងដំណើរការ", statusShipped: "កំពុងដឹក",
    statusDelivered: "បានដឹកដល់", statusCancelled: "បានលុបចោល",
    items: "មុខទំនិញ", paymentMethod: "ការទូទាត់", deliveryAddress: "អាសយដ្ឋានដឹក",
  },
  profile: {
    title: "គណនីរបស់ខ្ញុំ", editProfile: "កែប្រែប្រវត្តិរូប",
    name: "ឈ្មោះពេញ", phone: "ទូរស័ព្ទ",
    save: "រក្សាទុក", signOut: "ចាកចេញ",
    signInPrompt: "ចូលទៅក្នុងគណនី", registerPrompt: "ចុះឈ្មោះ",
    orders: "ការបញ្ជាទិញ", settings: "ការកំណត់", language: "ភាសា",
  },
  common: {
    loading: "កំពុងផ្ទុក...", error: "មានបញ្ហាកើតឡើង",
    retry: "ព្យាយាមម្ដងទៀត", cancel: "បោះបង់",
    save: "រក្សាទុក", close: "បិទ", confirm: "បញ្ជាក់",
    delete: "លុប", search: "ស្វែងរក",
  },
  checkout: {
    title: "ការទូទាត់", fullName: "ឈ្មោះពេញ", phoneLabel: "ទូរស័ព្ទ", deliveryAddress: "អាសយដ្ឋានដឹក",
    province: "ខេត្ត/រាជធានី", selectProvince: "ជ្រើសខេត្ត",
    city: "ក្រុង / ស្រុក", commune: "ឃុំ / សង្កាត់", address: "អាសយដ្ឋាន",
    addressPlaceholder: "ផ្លូវ, លេខផ្ទះ, ភូមិ...",
    deliveryZone: "តំបន់ដឹក", paymentMethod: "វិធីទូទាត់",
    couponPlaceholder: "លេខកូដប័ណ្ណ", applyCoupon: "អនុវត្ត",
    notes: "ចំណាំ (ស្រេចចិត្ត)", notesPlaceholder: "ការណែនាំ...",
    orderSummary: "សង្ខេបការបញ្ជាទិញ", subtotal: "តម្លៃសរុបរង",
    delivery: "ការដឹក", discount: "ការបញ្ចុះតម្លៃ", total: "សរុប",
    placeOrder: "ដាក់ការបញ្ជាទិញ", placing: "កំពុងដាក់...",
    success: "បានដាក់ការបញ្ជាទិញ!", error: "ដាក់ការបញ្ជាទិញបរាជ័យ",
  },
};

const ja: TranslationSchema = {
  nav: {
    home: "ホーム", products: "商品", cart: "カート", wishlist: "お気に入り",
    orders: "注文履歴", profile: "マイページ", login: "ログイン", logout: "ログアウト",
    search: "商品を検索...",
  },
  home: {
    badge: "プノンペン市内送料無料",
    heroTitle: "カンボジアの", heroHighlight: "おすすめ商品",
    heroSubtitle: "USD・KHR払い対応。ABA・ACLEDA・Wing・代引き利用可。",
    heroCta: "今すぐ購入",
    categoriesTitle: "カテゴリーから探す",
    featuredTitle: "注目の商品", viewAll: "すべて見る",
  },
  products: {
    title: "すべての商品", found: "{count}件見つかりました",
    inStock: "在庫あり", outOfStock: "在庫なし", onlyLeft: "残り{count}点",
    addToCart: "カートに追加", addedToCart: "カートに追加しました",
    description: "商品説明", related: "関連商品",
    freeDelivery: "プノンペン市内$20以上で送料無料",
    sortLatest: "新着順", sortPriceAsc: "価格: 安い順", sortPriceDesc: "価格: 高い順",
    empty: "商品が見つかりません", emptyHint: "フィルターを変えてお試しください",
  },
  cart: {
    title: "ショッピングカート", empty: "カートは空です",
    emptyHint: "商品を探してカートに追加してください！",
    emptyCta: "今すぐ購入", subtotal: "小計", delivery: "配送料",
    deliveryNote: "注文確認時に計算", total: "合計",
    checkout: "レジに進む", continueShopping: "買い物を続ける",
  },
  auth: {
    loginTitle: "おかえりなさい", loginSubtitle: "アカウントにログイン",
    email: "メールアドレス", password: "パスワード", login: "ログイン",
    noAccount: "アカウントをお持ちでない方", register: "新規登録",
    registerTitle: "アカウントを作成", name: "お名前", phone: "電話番号",
    confirm: "パスワードの確認", createAccount: "アカウントを作成",
    hasAccount: "すでにアカウントをお持ちの方", signin: "ログイン",
    passwordMismatch: "パスワードが一致しません",
    forgotPassword: "パスワードをお忘れですか?", sendReset: "リセットリンクを送信",
    backToLogin: "ログインに戻る",
    loginError: "メールアドレスまたはパスワードが間違っています",
    registerError: "登録に失敗しました",
  },
  order: {
    title: "注文 #{number}", allOrders: "すべての注文",
    statusPending: "保留中", statusConfirmed: "確認済み", statusProcessing: "処理中",
    statusShipped: "発送済み", statusDelivered: "配達完了", statusCancelled: "キャンセル",
    items: "注文商品", paymentMethod: "お支払い方法", deliveryAddress: "お届け先",
  },
  profile: {
    title: "マイページ", editProfile: "プロフィールを編集",
    name: "お名前", phone: "電話番号",
    save: "保存する", signOut: "ログアウト",
    signInPrompt: "アカウントにログイン", registerPrompt: "新規登録",
    orders: "注文履歴", settings: "設定", language: "言語",
  },
  common: {
    loading: "読み込み中...", error: "エラーが発生しました",
    retry: "再試行", cancel: "キャンセル", save: "保存",
    close: "閉じる", confirm: "確認", delete: "削除", search: "検索",
  },
  checkout: {
    title: "ご注文手続き", fullName: "お名前", phoneLabel: "電話番号", deliveryAddress: "配送先",
    province: "州・省", selectProvince: "州・省を選択",
    city: "市・郡", commune: "コミューン・村", address: "住所",
    addressPlaceholder: "番地・建物名・村...",
    deliveryZone: "配送エリア", paymentMethod: "お支払い方法",
    couponPlaceholder: "クーポンコード", applyCoupon: "適用",
    notes: "配送メモ（任意）", notesPlaceholder: "特別なご要望...",
    orderSummary: "ご注文内容", subtotal: "小計",
    delivery: "配送料", discount: "割引", total: "合計",
    placeOrder: "注文を確定する", placing: "注文処理中...",
    success: "ご注文が完了しました！", error: "注文に失敗しました",
  },
};

const zh: TranslationSchema = {
  nav: {
    home: "首页", products: "商品", cart: "购物车", wishlist: "收藏夹",
    orders: "我的订单", profile: "我的账户", login: "登录", logout: "退出",
    search: "搜索商品...",
  },
  home: {
    badge: "金边市内免费配送",
    heroTitle: "柬埔寨", heroHighlight: "优质好物",
    heroSubtitle: "支持 USD 和 KHR 支付。接受 ABA、ACLEDA、Wing 及货到付款。",
    heroCta: "立即购物",
    categoriesTitle: "按类别浏览",
    featuredTitle: "精选商品", viewAll: "查看全部",
  },
  products: {
    title: "全部商品", found: "找到 {count} 件商品",
    inStock: "有货", outOfStock: "缺货", onlyLeft: "仅剩 {count} 件",
    addToCart: "加入购物车", addedToCart: "已加入购物车",
    description: "商品描述", related: "相关商品",
    freeDelivery: "金边市内满 $20 免费配送",
    sortLatest: "最新", sortPriceAsc: "价格：从低到高", sortPriceDesc: "价格：从高到低",
    empty: "未找到商品", emptyHint: "请尝试调整筛选条件",
  },
  cart: {
    title: "购物车", empty: "购物车是空的",
    emptyHint: "浏览商品并添加您喜欢的商品！",
    emptyCta: "立即购物", subtotal: "小计", delivery: "配送费",
    deliveryNote: "结账时计算", total: "合计",
    checkout: "前往结账", continueShopping: "继续购物",
  },
  auth: {
    loginTitle: "欢迎回来", loginSubtitle: "登录您的账户",
    email: "邮箱", password: "密码", login: "登录",
    noAccount: "还没有账户？", register: "注册",
    registerTitle: "创建账户", name: "姓名", phone: "电话",
    confirm: "确认密码", createAccount: "创建账户",
    hasAccount: "已有账户？", signin: "登录",
    passwordMismatch: "两次密码不一致",
    forgotPassword: "忘记密码？", sendReset: "发送重置链接",
    backToLogin: "返回登录",
    loginError: "邮箱或密码不正确",
    registerError: "注册失败",
  },
  order: {
    title: "订单 #{number}", allOrders: "全部订单",
    statusPending: "待处理", statusConfirmed: "已确认", statusProcessing: "处理中",
    statusShipped: "已发货", statusDelivered: "已送达", statusCancelled: "已取消",
    items: "商品", paymentMethod: "支付方式", deliveryAddress: "收货地址",
  },
  profile: {
    title: "我的账户", editProfile: "编辑资料",
    name: "姓名", phone: "电话",
    save: "保存更改", signOut: "退出登录",
    signInPrompt: "登录您的账户", registerPrompt: "注册新账户",
    orders: "我的订单", settings: "设置", language: "语言",
  },
  common: {
    loading: "加载中...", error: "出现错误",
    retry: "重试", cancel: "取消", save: "保存",
    close: "关闭", confirm: "确认", delete: "删除", search: "搜索",
  },
  checkout: {
    title: "结账", fullName: "姓名", phoneLabel: "电话", deliveryAddress: "配送地址",
    province: "省份", selectProvince: "选择省份",
    city: "城市 / 区县", commune: "公社 / 街道", address: "详细地址",
    addressPlaceholder: "街道、门牌号...",
    deliveryZone: "配送区域", paymentMethod: "支付方式",
    couponPlaceholder: "优惠券码", applyCoupon: "使用",
    notes: "订单备注（可选）", notesPlaceholder: "特殊要求...",
    orderSummary: "订单摘要", subtotal: "小计",
    delivery: "配送费", discount: "优惠", total: "合计",
    placeOrder: "提交订单", placing: "正在提交...",
    success: "订单已提交！", error: "订单提交失败",
  },
};

export const translations: Record<Locale, TranslationSchema> = { en, km, ja, zh };
