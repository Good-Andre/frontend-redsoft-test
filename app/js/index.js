'use strict';

const productList = document.querySelector('.main__gallery');

let cart = JSON.parse(localStorage.getItem('cartTestRedsoft')) || [];

loadProducts(); // LOAD local storage

function showLoader(spinnerWrapper) {
  spinnerWrapper.textContent = '';
  spinnerWrapper.insertAdjacentHTML(
    'beforeend',
    '<section class="sk-fading-circle">' +
      '<div class="sk-circle sk-circle-1"></div>' +
      '<div class="sk-circle sk-circle-2"></div>' +
      '<div class="sk-circle sk-circle-3"></div>' +
      '<div class="sk-circle sk-circle-4"></div>' +
      '<div class="sk-circle sk-circle-5"></div>' +
      '<div class="sk-circle sk-circle-6"></div>' +
      '<div class="sk-circle sk-circle-7"></div>' +
      '<div class="sk-circle sk-circle-8"></div>' +
      '<div class="sk-circle sk-circle-9"></div>' +
      '<div class="sk-circle sk-circle-10"></div>' +
      '<div class="sk-circle sk-circle-11"></div>' +
      '<div class="sk-circle sk-circle-12"></div>' +
      '</section>'
  );
}

function hideLoader(spinnerWrapper) {
  setTimeout(function () {
    spinnerWrapper.classList.add('in-cart');
    spinnerWrapper.textContent = 'В корзине';
  }, 1000);
}

const getProduct = function (spinnerWrapper, id) {
  showLoader(spinnerWrapper);
  let url = 'https://reqres.in/api/unknown/' + id;

  function myFetch(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onload = function () {
      callback(xhr.responseText);
    };

    xhr.send();
  }

  function loadData(data) {
    data = JSON.parse(data);
    saveProduct(data.data);
    hideLoader(spinnerWrapper);
  }

  myFetch(url, loadData);
};

productList.addEventListener('click', function (event) {
  let target = event.target;
  if (target.classList.contains('gallery-item__btn')) {
    const btn = target;
    if (!btn.classList.contains('in-cart')) {
      const id = btn.dataset.id;
      getProduct(btn, id);
    } else if (btn.classList.contains('in-cart')) {
      btn.classList.remove('in-cart');
      btn.textContent = 'Купить';
      removeProduct(btn);
    }
  }
});

function loadProducts() {
    const galleryItemBtns = document.querySelectorAll('.gallery-item__btn');

    for (let i = 0; i < galleryItemBtns.length; i++) {
      let btn = galleryItemBtns[i];

      for (let i = 0; i < cart.length; i++) {
        if (
          cart[i].id ===
          +btn.dataset.id
        ) {
          btn.classList.add('in-cart');
          btn.textContent = 'В корзине';
        }
      }
    }

  // console.log('Корзина после загрузки', cart); // dev
}

function removeProduct(btn) {
  let oldCart = cart;
  cart = [];

  for (let i = 0; i < oldCart.length; i++) {
    if (
      oldCart[i].id !==
      +btn.dataset.id
    ) {
      cart.push(oldCart[i]);
    }
  }

  // console.log('Корзина после изменения', cart); // dev
  localStorage.setItem('cartTestRedsoft', JSON.stringify(cart));
}

function saveProduct(data) {
  cart.push(data);
  // console.log('Корзина после добавления', cart); // dev
  localStorage.setItem('cartTestRedsoft', JSON.stringify(cart));
}

//# sourceMappingURL=index.js.map
