/*****************************
 *      THEME MANAGEMENT     *
 *****************************/
let isDarkTheme = false;
const themeIcon = document.getElementById("icon");

function initTheme() {
  // Get saved theme or system preference
  const savedTheme = localStorage.getItem("themePreference");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  isDarkTheme = savedTheme ? savedTheme === "dark" : systemDark;

  // Apply initial theme
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeIcon.src = `img/icons/${isDarkTheme ? "sun" : "moon2"}.png`;

  // Theme toggle handler
  themeIcon.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle("dark-theme");
    themeIcon.src = `img/icons/${isDarkTheme ? "sun" : "moon2"}.png`;
    localStorage.setItem("themePreference", isDarkTheme ? "dark" : "light");
  });
}

/*****************************
 *      TRANSLATION SYSTEM   *
 *****************************/
let translations = {}; // Will store loaded translations

async function loadTranslations(lang) {
  try {
    const response = await fetch("translations.json");
    translations = await response.json();
    applyTranslations(lang);
  } catch (error) {
    console.error("Error loading translations:", error);
  }
}

function applyTranslations(lang) {
  // Update elements with data-translate
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.dataset.translate;
    if (translations[lang]?.[key]) {
      element.textContent = translations[lang][key];
    }
  });

  // Update placeholders and dynamic content
  document
    .querySelectorAll("[data-translate-placeholder], [data-translate-dynamic]")
    .forEach((element) => {
      const key =
        element.dataset.translatePlaceholder ||
        element.dataset.translateDynamic;
      if (translations[lang]?.[key]) {
        if (element.hasAttribute("placeholder")) {
          element.placeholder = translations[lang][key];
        } else {
          element.textContent = translations[lang][key];
        }
      }
    });

  // Update search placeholder (fallback for specific cases)
  const searchPlaceholder = translations[lang]?.searchPlaceholder || "Search";
  document.getElementById("searchInput").placeholder = searchPlaceholder;
}

// Language selector handler
document
  .querySelector(".custom-language-select")
  .addEventListener("change", (e) => {
    const lang = e.target.value;
    localStorage.setItem("selectedLang", lang);
    loadTranslations(lang);
  });

// Initialize translations
let savedLang = localStorage.getItem("selectedLang") || "en";
document.querySelector(".custom-language-select").value = savedLang;
loadTranslations(savedLang);

/*****************************
 *      PRODUCT LOADING      *
 *****************************/
// function loadProducts() {
//   fetch("products.json")
//     .then((response) => response.json())
//     .then((data) => {
//       const catalogGrid = document.getElementById("catalogGrid");
//       if (!catalogGrid) return; // Prevents error if element is missing
//       catalogGrid.innerHTML = "";

//       data.products.forEach((product) => {
//         const tile = document.createElement("div");
//         tile.classList.add("product-tile");

//         // Add data attributes for filtering based on category, majorGroup, and minorGroup
//         tile.setAttribute("data-category", product.category);
//         tile.setAttribute("data-major-group", product.majorGroup);
//         tile.setAttribute("data-minor-group", product.minorGroup);

//         tile.innerHTML = `
//           <img src="${product.images.thumbnail}" alt="${
//           product.name
//         }" loading="lazy" onclick="openQuickView(${JSON.stringify(
//           product
//         ).replace(/"/g, "&quot;")})" />
//           <button class="quick-view-btn" onclick="openQuickView(${JSON.stringify(
//             product
//           ).replace(/"/g, "&quot;")})">
//             Quick View
//           </button>
//           <div class="product-details">
//             <h3 data-translate-dynamic="${product.translationKey}">${
//           product.name
//         }</h3>
//             <p class="product-price"><strong>Price:</strong> ${
//               product.price
//             }</p>
//             <p class="product-brand"><strong>Brand:</strong> ${
//               product.brand
//             }</p>
//             <p class="product-rating"><strong>Rating:</strong> ${
//               product.ratings
//             } / 5</p>
//           </div>
//         `;
//         catalogGrid.appendChild(tile);
//       });

//       // Re-apply translations after loading products
//       loadTranslations(savedLang);
//     })
//     .catch((err) => console.error("Error loading products:", err));
// }

/*****************************
 *      PRODUCT DETAILS      *
 *****************************/
// Function to load product details dynamically
function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    document.getElementById("productDetails").innerHTML = `
      <div class="col-12 text-center">
        <h2>Product not found</h2>
        <p>We couldn't find the product you're looking for.</p>
        <a href="product-catalog.html" class="btn btn-primary">Back to Catalog</a>
      </div>
    `;
    return;
  }

  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      const product = data.products.find((p) => p.id == productId);

      if (!product) {
        document.getElementById("productDetails").innerHTML = `
          <div class="col-12 text-center">
            <h2>Product not found</h2>
            <p>We couldn't find the product you're looking for.</p>
            <a href="product-catalog.html" class="btn btn-primary">Back to Catalog</a>
          </div>
        `;
        return;
      }

      document.getElementById("productDetails").innerHTML = `
        <div class="col-md-6">
          <img src="${product.images.thumbnail}" alt="${
        product.name
      }" class="img-fluid" loading="lazy" />
        </div>
        <div class="col-md-6">
          <h1>${product.name}</h1>
          <p class="text-muted">${product.brand}</p>
          <h3 class="text-primary">${product.price}</h3>
          <p>${product.description}</p>
          <div class="ratings">
            <span>${"★".repeat(Math.floor(product.ratings))}${"☆".repeat(
        5 - Math.floor(product.ratings)
      )}</span>
            <span>(${product.ratings} / 5)</span>
          </div>
          <button class="btn btn-primary mt-3" onclick="addToCart(${JSON.stringify(
            product
          ).replace(/"/g, "&quot;")})">Add to Cart</button>
          <button class="btn btn-secondary mt-3" onclick="addToWishlist(${JSON.stringify(
            product
          ).replace(/"/g, "&quot;")})">Add to Wishlist</button>
        </div>
      `;
    })
    .catch((error) => {
      console.error("Error fetching product details:", error);
      document.getElementById("productDetails").innerHTML = `
        <div class="col-12 text-center">
          <h2>Error</h2>
          <p>There was an error loading the product details. Please try again later.</p>
        </div>
      `;
    });
}

// Initialize product details on product-details.html
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.contains(document.getElementById("productDetails"))) {
    loadProductDetails();
  }
});
/*****************************
 *      MODAL FUNCTIONALITY  *
 *****************************/ // Function to open the Quick View modal
function openQuickView(product) {
  // Set product details in modal
  document.querySelector(".modal-product-title").textContent = product.name;
  document.querySelector(".modal-price").textContent = product.price;
  document.querySelector(".modal-brand").textContent = product.brand;
  document.querySelector(".modal-description").textContent =
    product.description;
  document.querySelector(".modal-rating-value").textContent = product.ratings;

  // View Details button
  document
    .querySelector(".view-details-btn")
    .setAttribute(
      "onclick",
      `window.location.href='product-details.html?id=${product.id}'`
    );

  // Add to Cart button
  document.querySelector(".add-to-cart-btn").onclick = function () {
    addToCart(product);
  };

  // Show modal
  document.getElementById("quickViewModal").style.display = "flex";
}

// Add event listeners for closing the modal
document.addEventListener("DOMContentLoaded", () => {
  // Close modal when the close button is clicked
  document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("quickViewModal").style.display = "none";
  });

  // Close modal when clicking outside the modal content
  document
    .getElementById("quickViewModal")
    .addEventListener("click", (event) => {
      if (event.target === document.getElementById("quickViewModal")) {
        document.getElementById("quickViewModal").style.display = "none";
      }
    });

  // Initialize cart count
  updateCartCount();
});

// Function to add a product to the cart
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images.thumbnail,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // Show confirmation
  alert(`${product.name} added to cart!`);
}

// Function to update the cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCountElement = document.getElementById("cart-count");

  if (cartCountElement) {
    cartCountElement.textContent = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }
}
/*****************************
 *      CATEGORY FILTERING   *
 *****************************/
function filterMajorCategory(major) {
  document.querySelectorAll(".product-tile").forEach((tile) => {
    const tileMajor = tile.getAttribute("data-major-group");
    const shouldDisplay = major === "all" || tileMajor === major;
    tile.style.display = shouldDisplay ? "grid" : "none";
    tile.style.animation = shouldDisplay ? "fadeIn 0.3s ease" : "none";
  });

  // Update active state on major category buttons
  document.querySelectorAll(".categories-section button").forEach((btn) => {
    // Compare using the expected translation key format, e.g., "categoryApparel"
    btn.classList.toggle(
      "active",
      btn.getAttribute("data-translate") ===
        `category${major.charAt(0).toUpperCase() + major.slice(1)}`
    );
  });
}

function filterMinorCategory(minor) {
  document.querySelectorAll(".product-tile").forEach((tile) => {
    const tileMinor = tile.getAttribute("data-minor-group");
    const shouldDisplay = minor === "all" || tileMinor === minor;
    tile.style.display = shouldDisplay ? "grid" : "none";
    tile.style.animation = shouldDisplay ? "fadeIn 0.3s ease" : "none";
  });

  // Update active state on minor category buttons
  document.querySelectorAll(".categories-section button").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.getAttribute("data-translate") ===
        `category${minor.charAt(0).toUpperCase() + minor.slice(1)}`
    );
  });
}

/*****************************
 *      INITIALIZATION       *
 *****************************/
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  // loadProducts();

  // Initialize category filters
  document.querySelectorAll(".filter-major-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterMajorCategory(btn.dataset.category);
    });
  });

  // Initialize minor category filters
  document.querySelectorAll(".filter-minor-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterMinorCategory(btn.dataset.category);
    });
  });
});

/*****************************
 *      OTHER       *
 *****************************/
// Function to add a product to the wishlist
function addToWishlist(product) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // Check if the product is already in the wishlist
  const existingItem = wishlist.find((item) => item.id === product.id);

  if (existingItem) {
    alert(`${product.name} is already in your wishlist!`);
  } else {
    wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images.thumbnail,
    });

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    alert(`${product.name} has been added to your wishlist!`);
  }
}

// Function to display the wishlist on the wishlist page
function displayWishlist() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const wishlistGrid = document.getElementById("wishlistGrid");
  const wishlistMessage = document.getElementById("wishlistMessage");

  if (wishlist.length === 0) {
    wishlistMessage.textContent = "Your wishlist is empty.";
    wishlistGrid.innerHTML = "";
    return;
  }

  wishlistMessage.textContent = "";
  wishlistGrid.innerHTML = wishlist
    .map(
      (item) => `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="${item.image}" class="card-img-top" alt="${item.name}" loading="lazy"/>
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">Price: ${item.price}</p>
            <button class="btn btn-danger" onclick="removeFromWishlist(${item.id})">Remove</button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Function to remove an item from the wishlist
function removeFromWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter((item) => item.id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  displayWishlist();
}

/*****************************
 *      OTHER       *
 *****************************/
function handleSearchInput(event) {
  const query = event.target.value.toLowerCase();
  const suggestionsContainer = document.getElementById("searchSuggestions");

  // Clear previous suggestions
  suggestionsContainer.innerHTML = "";

  if (query.length === 0) {
    return;
  }

  // Fetch products and filter based on the query
  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      const suggestions = data.products.filter((product) =>
        product.name.toLowerCase().includes(query)
      );

      // Display suggestions
      suggestions.forEach((product) => {
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion");
        suggestionItem.textContent = product.name;
        suggestionItem.onclick = () => {
          // Set input value and clear suggestions
          document.getElementById("searchInput").value = product.name;
          suggestionsContainer.innerHTML = "";

          // Optionally, filter the catalog grid
          filterCatalogBySearch(product.name);
        };
        suggestionsContainer.appendChild(suggestionItem);
      });
    })
    .catch((err) => console.error("Error fetching products:", err));
}

function filterCatalogBySearch(query) {
  document.querySelectorAll(".product-tile").forEach((tile) => {
    const productName = tile.querySelector(".product-details h3").textContent;
    tile.style.display = productName.toLowerCase().includes(query.toLowerCase())
      ? "grid"
      : "none";
  });
}

/*****************************
 *      FILTER FUNCTIONALITY *
 *****************************/

// Initialize filters
function initializeFilters(products) {
  populateBrandFilters(products);
  populateSizeFilters(products);
  setupPriceRange(products);
}

// Populate Brand Filters
function populateBrandFilters(products) {
  const brandFilters = document.getElementById("brandFilters");
  const brands = [...new Set(products.map((product) => product.brand))];

  brands.forEach((brand) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${brand}" onchange="applyFilters()" />
      ${brand}
    `;
    brandFilters.appendChild(label);
  });
}

// Populate Size Filters
function populateSizeFilters(products) {
  const sizeFilters = document.getElementById("sizeFilters");
  const sizes = [
    ...new Set(
      products.flatMap(
        (product) => product.specifications?.size?.split("-") || []
      )
    ),
  ];

  sizes.forEach((size) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${size}" onchange="applyFilters()" />
      ${size}
    `;
    sizeFilters.appendChild(label);
  });
}

// Setup Price Range
function setupPriceRange(products) {
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const minPrice = document.getElementById("minPrice");
  const maxPrice = document.getElementById("maxPrice");

  const prices = products.map((product) =>
    parseFloat(product.price.replace("$", ""))
  );
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  priceMin.min = minPrice.textContent = `$${min}`;
  priceMin.max = priceMax.max = maxPrice.textContent = `$${max}`;
  priceMin.value = min;
  priceMax.value = max;

  priceMin.addEventListener("input", applyFilters);
  priceMax.addEventListener("input", applyFilters);
}

// Apply Filters
function applyFilters() {
  const priceMin = parseFloat(document.getElementById("priceMin").value);
  const priceMax = parseFloat(document.getElementById("priceMax").value);
  const selectedBrands = Array.from(
    document.querySelectorAll("#brandFilters input:checked")
  ).map((input) => input.value);
  const selectedSizes = Array.from(
    document.querySelectorAll("#sizeFilters input:checked")
  ).map((input) => input.value);
  const discountFilter = document.getElementById("discountFilter").checked;

  document.querySelectorAll(".product-tile").forEach((tile) => {
    const productPrice = parseFloat(
      tile.querySelector(".product-price").textContent.replace("$", "")
    );
    const productBrand = tile
      .querySelector(".product-brand")
      .textContent.split(": ")[1];
    const productSizes = tile.getAttribute("data-sizes")?.split(",") || [];
    const hasDiscount = tile.getAttribute("data-discount") === "true";

    const matchesPrice = productPrice >= priceMin && productPrice <= priceMax;
    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(productBrand);
    const matchesSize =
      selectedSizes.length === 0 ||
      selectedSizes.some((size) => productSizes.includes(size));
    const matchesDiscount = !discountFilter || hasDiscount;

    tile.style.display =
      matchesPrice && matchesBrand && matchesSize && matchesDiscount
        ? "grid"
        : "none";
  });
}

// Load Products and Initialize Filters
function loadProductsWithFilters() {
  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      const products = data.products;

      // Populate catalog grid
      const catalogGrid = document.getElementById("catalogGrid");
      catalogGrid.innerHTML = "";
      products.forEach((product) => {
        const tile = document.createElement("div");
        tile.classList.add("product-tile");
        tile.setAttribute("data-sizes", product.specifications?.size || "");
        tile.setAttribute(
          "data-discount",
          product.price.includes("Save") ? "true" : "false"
        );

  //       tile.innerHTML = `
  //         <img src="${product.images.thumbnail}" alt="${product.name}" loading="lazy" />
  //         <div class="product-details">
  //           <h3>${product.name}</h3>
  //           <p class="product-price">${product.price}</p>
  //           <p class="product-brand">Brand: ${product.brand}</p>
  //         </div>
  //       `;
  //       // Add event listeners for modal opening
  // tile.querySelector(".quick-view-img").onclick = () => openQuickView(product);
  // tile.querySelector(".quick-view-btn").onclick = () => openQuickView(product);

  //       catalogGrid.appendChild(tile);


              tile.innerHTML = `
          <img src="${product.images.thumbnail}" alt="${
          product.name
        }" loading="lazy" onclick="openQuickView(${JSON.stringify(
          product
        ).replace(/"/g, "&quot;")})" />
          <button class="quick-view-btn" onclick="openQuickView(${JSON.stringify(
            product
          ).replace(/"/g, "&quot;")})">
            Quick View
          </button>
          <div class="product-details">
            <h3 data-translate-dynamic="${product.translationKey}">${
          product.name
        }</h3>
            <p class="product-price"><strong>Price:</strong> ${
              product.price
            }</p>
            <p class="product-brand"><strong>Brand:</strong> ${
              product.brand
            }</p>
            <p class="product-rating"><strong>Rating:</strong> ${
              product.ratings
            } / 5</p>
          </div>
        `;
        catalogGrid.appendChild(tile);
        
         loadTranslations(savedLang);
      });

      // Initialize filters
      initializeFilters(products);
    })
    .catch((err) => console.error("Error loading products:", err));
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadProductsWithFilters();
});
