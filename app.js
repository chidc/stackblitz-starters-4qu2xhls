// Product Database
const products = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 30.00, rating: 4.5, category: "Classic" },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 21.00, rating: 4.8, category: "Classic" },
    { id: 3, title: "1984", author: "George Orwell", price: 25.50, rating: 4.6, category: "Dystopian" },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", price: 18.99, rating: 4.7, category: "Romance" }
];

// Categories
const categories = ["All", "Classic", "Dystopian", "Romance", "Fantasy"];

// Cart Management
class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
    }

    loadCart() {
        const saved = sessionStorage.getItem('bookCart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        sessionStorage.setItem('bookCart', JSON.stringify(this.cart));
        this.updateCartUI();
    }

    addItem(productId, quantity = 1) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: productId,
                title: product.title,
                author: product.author,
                price: product.price,
                quantity: quantity
            });
        }
        this.saveCart();
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clear() {
        this.cart = [];
        this.saveCart();
    }

    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'block' : 'none';
        }
    }
}

// Initialize Cart
const cart = new ShoppingCart();

// Render Cart Page
function renderCart() {
    const cartList = document.querySelector('.cart-list');
    if (!cartList) return;

    if (cart.cart.length === 0) {
        cartList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Your cart is empty</p>';
        document.querySelector('.cart-summary').style.display = 'none';
        document.querySelector('.checkout-btn').style.display = 'none';
        return;
    }

    cartList.innerHTML = cart.cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-img"></div>
            <div class="cart-info">
                <p class="book-title">${item.title}</p>
                <p class="book-price">$${item.price.toFixed(2)}</p>
                <div class="qty-control">
                    <button class="qty-btn decrease" data-id="${item.id}">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-btn" data-id="${item.id}" style="color: #e74c3c; border: none; background: none; cursor: pointer; margin-top: 5px;">Remove</button>
            </div>
        </div>
    `).join('');

    updateCartSummary();
    attachCartEventListeners();
}

// Update Cart Summary
function updateCartSummary() {
    const total = cart.getTotal();
    const deliveryFee = 5.00;
    const grandTotal = total + deliveryFee;

    const summaryElement = document.querySelector('.cart-summary');
    if (summaryElement) {
        summaryElement.innerHTML = `
            <p>Subtotal: <span>$${total.toFixed(2)}</span></p>
            <p>Delivery Services: <span>$${deliveryFee.toFixed(2)}</span></p>
            <p class="total">Total: <span>$${grandTotal.toFixed(2)}</span></p>
        `;
    }
}

// Attach Cart Event Listeners
function attachCartEventListeners() {
    document.querySelectorAll('.qty-btn.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const item = cart.cart.find(i => i.id === id);
            if (item && item.quantity > 1) {
                cart.updateQuantity(id, item.quantity - 1);
            } else if (item) {
                cart.removeItem(id);
                renderCart();
            }
        });
    });

    document.querySelectorAll('.qty-btn.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const item = cart.cart.find(i => i.id === id);
            if (item) {
                cart.updateQuantity(id, item.quantity + 1);
            }
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            cart.removeItem(id);
            renderCart();
        });
    });
}

// Setup Details Page with Product Data
function setupDetailsPage() {
    // Get or set a random product for this session
    let productId = sessionStorage.getItem('currentProductId');
    if (!productId) {
        productId = Math.floor(Math.random() * products.length) + 1;
        sessionStorage.setItem('currentProductId', productId);
    }
    
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
        document.querySelector('.book-title').textContent = product.title;
        document.querySelector('.book-author').textContent = product.author;
        document.querySelector('.book-price').innerHTML = `$${product.price.toFixed(2)} <span class="rating">(${product.rating}★)</span>`;
    }
    
    const buyBtn = document.querySelector('.add-to-cart-btn');
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            const id = parseInt(productId);
            cart.addItem(id, 1);
            alert('Item added to cart!');
        });
    }
}

// Setup Homepage
function setupHomePage() {
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach((card, index) => {
        const productId = (index % products.length) + 1;
        const product = products[productId - 1];
        
        // Update product info in the card
        const title = card.querySelector('.book-title');
        const author = card.querySelector('.book-author');
        const price = card.querySelector('.book-price');
        
        if (title) title.textContent = product.title;
        if (author) author.textContent = product.author;
        if (price) price.textContent = `$${product.price.toFixed(2)}`;
        
        // Set onclick to store the product ID
        card.addEventListener('click', (e) => {
            sessionStorage.setItem('currentProductId', productId);
        });
    });

    // Setup category tabs and books on home page
    renderCategoryTabs();
    renderCategoryBooks();
}

// Setup Categories Page
function setupCategoriesPage() {
    renderCategoryTabs();
    renderCategoryBooks();
}

// Render Category Tabs
function renderCategoryTabs() {
    const categoryTabs = document.querySelector('.category-tabs');
    if (!categoryTabs) return;

    categoryTabs.innerHTML = categories
        .map((cat, index) => `
            <button class="tab ${index === 0 ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `)
        .join('');

    // Add event listeners to tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            e.target.classList.add('active');
            // Re-render books for selected category
            renderCategoryBooks();
        });
    });
}

// Get filtered products by category
function getProductsByCategory(category) {
    if (category === 'All') {
        return products;
    }
    return products.filter(product => product.category === category);
}

// Render Books by Category
function renderCategoryBooks() {
    const categoryBooks = document.querySelector('.category-books');
    if (!categoryBooks) return;

    // Get selected category from active tab
    const activeTab = document.querySelector('.tab.active');
    const selectedCategory = activeTab ? activeTab.dataset.category : 'All';

    const filteredProducts = getProductsByCategory(selectedCategory);

    categoryBooks.innerHTML = filteredProducts
        .map(product => `
            <a href="details.html" class="book-card" onclick="sessionStorage.setItem('currentProductId', ${product.id})">
                <div class="book-img"></div>
                <p class="book-title">${product.title}</p>
                <p class="book-author">${product.author}</p>
                <p class="book-price">$${product.price.toFixed(2)}</p>
            </a>
        `)
        .join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update cart UI on all pages
    cart.updateCartUI();

    // Page-specific initialization
    if (document.querySelector('.cart-screen')) {
        renderCart();
    } else if (document.querySelector('.details-screen')) {
        setupDetailsPage();
    } else if (document.querySelector('.home-screen')) {
        setupHomePage();
    } else if (document.querySelector('.categories-screen')) {
        setupCategoriesPage();
    }
});
