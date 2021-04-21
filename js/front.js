let productWrap = document.querySelector('.productWrap')
const shoppingCart = document.querySelector('.shoppingCart-table')
const productSelect = document.querySelector('.productSelect')
const formBtn = document.querySelector('.orderInfo-btn')


// 取得產品資料
let products = []
let filterProducts = []
const productUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/yu19941994/products`
function init() {
  axios.get(productUrl)
  .then((res) => {
    products = res.data.products
    filterProduct()
  })
}

let content = ''
// 印出產品列表
function renderProduct () {
  content = ''
  productWrap.innerHTML = ''
  filterProducts.forEach(e => {
    content = `
       <li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${e.images}"
          alt="">
        <a href="#" class="addCartBtn" data-id="${e.id}">加入購物車</a>
        <h3>${e.title}</h3>
        <del class="originPrice">NT${addComma(e.origin_price)}</del>
        <p class="nowPrice">NT${addComma(e.price)}</p>
      </li>
    `
    productWrap.innerHTML += content
  })
}

// 篩選產品種類
function filterProduct(item) {
  filterProducts = []
  if(item) {
    products.forEach(e => {
      if(item.target.value === '全部'){
        filterProducts = products
      }else if(e.category === item.target.value){
        filterProducts.push(e)
      }else{
        return
      }
    })
  }else{
    filterProducts = products
  }
  renderProduct()
}

// 取得購物車資料
let cart = []
let cartDetail = {}
const cartUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/yu19941994/carts`
function initCart () {
  axios.get(cartUrl)
    .then((res) => {
      cart = res.data.carts
      cartDetail = res.data
      renderCart(cart, cartDetail)
    })
}

let cartContent = ''
let cartTempor = ''

// 印出購物車列表
function renderCart (cart) {
  shoppingCart.innerHTML = ''
  cartContent = ''
  cartTempor = ''
  cart.forEach(e => {
    const cartHeader = `
      <tr>
        <th width="40%">品項</th>
        <th width="15%">單價</th>
        <th width="15%">數量</th>
        <th width="15%">金額</th>
        <th width="15%"></th>
      </tr>
    `
    let cartFooter = `
      <tr>
        <td>
          <a href="#" class="discardAllBtn">刪除所有品項</a>
        </td>
        <td></td>
        <td></td>
        <td>
          <p>總金額</p>
        </td>
        <td>NT${addComma(cartDetail.finalTotal)}</td>
      </tr> 
    `
    cartContent = `
        <tr>
          <td>
            <div class="cardItem-title">
              <img src="${e.product.images}" alt="">
              <p>${e.product.title}</p>
            </div>
          </td>
          <td>NT${addComma(e.product.price)}</td>
          <td>
            <button data-update="minus" data-updateId="${e.id}">-</button>
            ${e.quantity}
            <button data-update="plus" data-updateId="${e.id}">+</button>
          </td>
          <td>NT${addComma(e.quantity * e.product.price)}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons" data-delete="deleteSingle" data-deleteId="${e.id}">
              clear
            </a>
          </td>
        </tr>
    `
    cartTempor += cartContent
    shoppingCart.innerHTML = cartHeader + cartTempor + cartFooter
  })
}

productSelect.addEventListener('change', filterProduct)


// 加入購物車
// 因 innerHTML 的關係，必須監聽最外層再往內找 btn
const addCartUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/yu19941994/carts`
function addToCart (e) {
  e.preventDefault();
  let dataId = e.target.getAttribute('data-id')

  if(e.target.getAttribute('class') === 'addCartBtn'){
    let quantityNum = 1
    cart.forEach(item => {
      // 注意！是訂單中「對應的產品 id」，而非訂單的 id
      if(item.product.id === dataId){
        quantityNum = item.quantity += 1
      }
    })
    axios.post(addCartUrl,{ 
      data: { 
        productId: dataId, 
        quantity: quantityNum
      }
    })
    .then((res) => {
      console.log(res)
      initCart()
    })
    .catch((err) => {console.log(err)})
  }

}

productWrap.addEventListener('click', addToCart)


// 修改數量
const updateNumUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/yu19941994/carts`
function adjustNum (e) {
  let cartQuantity = 1
  const cartId = e.target.getAttribute('data-updateid') 
  if(e.target.getAttribute('data-update')  === 'plus'){
    cart.forEach(item => {
      if(item.id === cartId){ 
        cartQuantity = item.quantity+=1
        console.log(item.quantity+=1)
        submitAdjustNum(item.id, cartQuantity)
      }
    })
  }
  if(e.target.getAttribute('data-update')  === 'minus'){
    // cartQuantity = 1
    cart.forEach(item => {
      if(item.id === cartId){ 
        cartQuantity = item.quantity-=1
        if(cartQuantity<1){
          console.log(cartQuantity)
          return
        }
        submitAdjustNum(item.id, cartQuantity)

      }
    })
  }

}
function submitAdjustNum (itemId, cartQuantity) {
  axios.patch(updateNumUrl,{ 
    data: { 
      id: itemId, 
      quantity: cartQuantity
    }
  })
  .then((res) => {
    console.log(res)
    cart = res.data.carts
    cartDetail = res.data
    renderCart(cart, cartDetail)
  })
}

shoppingCart.addEventListener('click', adjustNum)

// 刪除所有購物車
const deleteAllUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/yu19941994/carts`
function deleteAllCart (e) {
  e.preventDefault()
  if(e.target.getAttribute('class') === 'discardAllBtn'){
    axios.delete(deleteAllUrl)
      .then((res) => {
        console.log(res)
        cart = res.data.carts
        cartDetail = res.data
        renderCart(cart, cartDetail)
      })
  }
}

shoppingCart.addEventListener('click', deleteAllCart)

// 刪除單筆 Cart
function deleteSingle (e) {
  const deleteId = e.target.getAttribute('data-deleteId')
  console.log(deleteId)
  if(e.target.getAttribute('data-delete') === 'deleteSingle'){
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/yu19941994/carts/${deleteId}`)
      .then((res) => {
        console.log(res)
        cart = res.data.carts
        cartDetail = res.data
        renderCart(cart, cartDetail)
      })
  }
}

shoppingCart.addEventListener('click', deleteSingle)

// 送出 order 訂單
const orderUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/yu19941994/orders`
function submitForm (e) {
  e.preventDefault()
  const formName = document.querySelector('#customerName').value
  const formPhone = document.querySelector('#customerPhone').value
  const formEmail = document.querySelector('#customerEmail').value
  const formAddress = document.querySelector('#customerAddress').value
  const formTradeWay = document.querySelector('#tradeWay').value
  axios.post(orderUrl, { 
    "data": { 
      "user": {
        "name": formName, 
        "tel": formPhone, 
        "email": formEmail, 
        "address": formAddress, 
        "payment": formTradeWay
      }
    }
  })
    .then((res)=> {
      console.log(res)
      let newOrderCart = []
      renderCart(newOrderCart)
      formName = ''
      formPhone = ''
      formEmail = ''
      formAddress = ''
      formTradeWay = 'ATM'
      
    })
    .catch((err)=> {console.log(err.message)})
}


formBtn.addEventListener('click', submitForm)

// 價錢加上逗號
function addComma (num) {
  return new Intl.NumberFormat('zh-Hant', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(num)
}



//初始化
init()
initCart()