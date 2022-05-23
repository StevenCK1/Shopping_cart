// Declaring variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// Cart
let cart = [];

// buttons
let buttonsDOM = [];

/*
class is a way to create new object without having to declare the same properties everytime
*/
//getting the products
class Products {
  // declaring method (writing a function) for the products object, async because mimics API
  async getProducts() {
    // try catch, try defines code block to run and catch defines code block to handle error
    try {
      let result = await fetch("products.json");
      let data = await result.json();

      // destructuring the array received from the API
      let products = data.items;

      // map method creates new array populated with the results of calling a provided function on every element in the calling array
      products = products.map((item) => {
        // replaces elements of the array with object with properties as written between {}
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  // display products from json file and adds html for each element in the array
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `        
      <article class="product">
        <div class="img-container">
          <img
            src=${product.image}
            alt="product"
            class="product-img"
          />
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>
            add to bag
          </button>
          <h3>${product.title}</h3>
          <h4>${product.price}</h4>
        </div>
      </article>
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    // use spread operator to destructure the nodelist into an array
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };

        // add product to the cart
        cart = [...cart, cartItem];

        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}
// set up local storage for the browser to access since if refresh, items will disappear from cart
// products in local for quick access, no need for asynchronous code
// IMPORTANT!!! local storage is not ideal if there are thousands of products
// Local storage
class Storage {
  static saveProducts(products) {
    // The localStorage read-only property of the window interface allows you to access a Storage object for the Document's origin; the stored data is saved across browser sessions.
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // creating the new objects from the classes and methods above
  const ui = new UI();
  const products = new Products();

  //setup app
  ui.setupApp();
  //get all products
  products
    .getProducts()
    .then((products) => {
      // then method is chain to a promise, in order to call a function once the promise is fulfilled
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      // chain again here because bag-btns will only be available for DOM once the page and all elements have been loaded
      ui.getBagButtons();
      ui.cartLogic();
    });
});
