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
  // question: how can products be accessed? isn't it blocked scope in the products class? Ans: products is just a parameter of displayProducts🙄
  // display products from json file
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `        
      <!-- single line product -->
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
      <!-- end of single line product -->
      `;
    });
    productsDOM.innerHTML = result;
  }
}

// Local storage
class Storage {}

document.addEventListener("DOMContentLoaded", () => {
  // creating the new objects from the classes and methods above
  const ui = new UI();
  const products = new Products();

  //get all products
  products.getProducts().then((products) => ui.displayProducts(products)); // then method is chain to a promise, in order to call a function once the promise is fulfilled
});
