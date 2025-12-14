document.addEventListener('DOMContentLoaded', function() {
    
    // --- VARIABLES GLOBALES ---
    const loginSection = document.getElementById('login-section');
    const appSection = document.getElementById('app-section');
    
    // Login
    const loginForm = document.getElementById('loginForm');
    const loginTitle = document.getElementById('loginTitle');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const toggleLoginMode = document.getElementById('toggleLoginMode');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Carrito
    const payBtn = document.getElementById('pay-btn');
    const cartContainer = document.getElementById('cart-container');
    const shippingList = document.getElementById('shipping-list');
    const cartSelectedInfo = document.getElementById('cart-selected-info');

    // Direcciones (Perfil)
    const addressActionBtn = document.getElementById('manage-addresses-btn');
    const addressList = document.getElementById('address-list');
    const newAddressForm = document.getElementById('new-address-form');
    const saveAddressBtn = document.getElementById('save-address-btn');
    const newAddressInput = document.getElementById('new-address-input');

    // Estado del Login
    let isRegisterMode = false;
    const users = [
        { email: "email@example.com", pass: "1234", name: "Usuario Prueba" }
    ];

    // 1. MANEJO DE LOGIN / REGISTRO
    toggleLoginMode.addEventListener('click', function() {
        isRegisterMode = !isRegisterMode;
        if (isRegisterMode) {
            loginTitle.textContent = "Crear Cuenta";
            loginSubmitBtn.textContent = "Registrar";
            toggleLoginMode.textContent = "¿Ya tienes cuenta? Inicia Sesión";
        } else {
            loginTitle.textContent = "Bienvenido";
            loginSubmitBtn.textContent = "Ingresar";
            toggleLoginMode.textContent = "¿No tienes cuenta? Regístrate aquí";
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const pass = passwordInput.value.trim();

        if (isRegisterMode) {
            if (!email.includes('@')) {
                alert("Por favor ingresa un correo válido.");
                return;
            }
            users.push({ email: email, pass: pass, name: "Nuevo Usuario" });
            alert("Usuario registrado. Ahora puedes ingresar.");
            isRegisterMode = false;
            loginTitle.textContent = "Bienvenido";
            loginSubmitBtn.textContent = "Ingresar";
            toggleLoginMode.textContent = "¿No tienes cuenta? Regístrate aquí";
            loginForm.reset();
        } else {
            const userFound = users.find(u => u.email === email && u.pass === pass);
            if (userFound) {
                loginSection.classList.add('d-none'); 
                appSection.classList.remove('d-none');
            } else {
                alert("Credenciales incorrectas.");
            }
        }
    });

    logoutBtn.addEventListener('click', function() {
        appSection.classList.add('d-none');
        loginSection.classList.remove('d-none');
        loginForm.reset();
        navigate('home'); 
    });

    // 2. LÓGICA DE CARRITO: AGREGAR DESDE HOME
    const homeAddButtons = document.querySelectorAll('.btn-add-cart');
    homeAddButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = this.getAttribute('data-price');
            const img = this.getAttribute('data-img');

            // Crear elemento de carrito con control de cantidad
            const newItemHTML = `
            <div class="d-flex align-items-start mb-3 align-items-center cart-item">
                <input class="form-check-input me-2 item-check" type="checkbox" checked>
                <div class="me-3 text-center" style="width: 80px;">
                    <img src="${img}" class="img-fluid rounded item-img" alt="${name}">
                </div>
                <div class="flex-grow-1">
                    <span class="badge bg-light text-dark border rounded-pill mb-1 item-name">${name}</span>
                    <p class="fw-bold mb-0 item-price">${price}</p>
                    <small class="text-danger fw-bold">Oferta del día</small><br>
                    <small class="text-dark">Envío Gratis</small>
                </div>
                <div class="d-flex align-items-center border rounded-pill px-2 py-1 ms-2" style="min-width: 85px; justify-content: space-between;">
                    <button class="btn btn-sm p-0 border-0 btn-decrease fw-bold" style="width: 20px;">-</button>
                    <span class="mx-1 small item-quantity">1</span>
                    <button class="btn btn-sm p-0 border-0 btn-increase fw-bold" style="width: 20px;">+</button>
                </div>
            </div>
            `;
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newItemHTML;
            cartContainer.appendChild(tempDiv.firstElementChild);
            
            alert(`${name} agregado al carrito.`);
            updateCartTotal(); 
            navigate('cart'); 
        });
    });


    // 3. LÓGICA DE CARRITO: INTERACTIVIDAD Y CÁLCULOS
    // Delegación de eventos para clicks en cartContainer (Checkboxes y Botones + / -)
    cartContainer.addEventListener('click', function(e) {
        
        // Manejar incremento
        if (e.target.classList.contains('btn-increase')) {
            const qtySpan = e.target.previousElementSibling; // El span de numero
            let qty = parseInt(qtySpan.innerText);
            if (qty < 5) {
                qty++;
                qtySpan.innerText = qty;
                updateCartTotal();
            }
        }

        // Manejar decremento
        if (e.target.classList.contains('btn-decrease')) {
            const qtySpan = e.target.nextElementSibling; // El span de numero
            let qty = parseInt(qtySpan.innerText);
            if (qty > 1) {
                qty--;
                qtySpan.innerText = qty;
                updateCartTotal();
            } else {
                // Si es 1 y baja, eliminar item
                if(confirm("¿Eliminar este producto del carrito?")) {
                    e.target.closest('.cart-item').remove();
                    updateCartTotal();
                }
            }
        }
    });

    // Escuchar cambios en checkboxes (separado del click para evitar doble trigger)
    cartContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-check')) {
            updateCartTotal();
        }
    });

    function updateCartTotal() {
        const checkedBoxes = cartContainer.querySelectorAll('.item-check:checked');
        let total = 0;
        let selectedNames = [];

        checkedBoxes.forEach(box => {
            const row = box.closest('.cart-item');
            const priceStr = row.querySelector('.item-price').innerText; 
            const name = row.querySelector('.item-name').innerText;
            const qty = parseInt(row.querySelector('.item-quantity').innerText);
            
            const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
            
            // Sumar precio * cantidad
            total += (price * qty);
            selectedNames.push(name);
        });

        if (total > 0) {
            const formattedTotal = "$" + total.toLocaleString('es-CO');
            payBtn.innerText = formattedTotal;
            if (selectedNames.length === 1) {
                cartSelectedInfo.innerText = selectedNames[0];
            } else {
                cartSelectedInfo.innerText = `${selectedNames.length} artículos seleccionados`;
            }
        } else {
            payBtn.innerText = "Pagar";
            cartSelectedInfo.innerText = "0 artículos seleccionados por pagar";
        }
    }

    // 4. LÓGICA DE PAGAR
    payBtn.addEventListener('click', function() {
        const selectedItems = cartContainer.querySelectorAll('.item-check:checked');
        if (selectedItems.length === 0) {
            alert("Selecciona al menos un artículo.");
            return;
        }

        selectedItems.forEach(checkbox => {
            const itemRow = checkbox.closest('.cart-item');
            const imgSrc = itemRow.querySelector('.item-img').src;
            const name = itemRow.querySelector('.item-name').innerText;
            const price = itemRow.querySelector('.item-price').innerText;
            const qty = itemRow.querySelector('.item-quantity').innerText;

            const newShippingHTML = `
            <div class="d-flex align-items-start mb-3 align-items-center">
                <input class="form-check-input me-2 rounded-circle" type="radio" name="envioGroup" checked>
                <div class="me-3 text-center" style="width: 70px;">
                    <img src="${imgSrc}" class="img-fluid rounded" alt="${name}">
                </div>
                <div class="flex-grow-1 ps-2">
                    <span class="badge bg-light text-dark border rounded-pill mb-1">${name} (x${qty})</span>
                    <div class="small fw-bold">Valor pagado: ${price}</div>
                    <small class="text-success fw-bold">Pago Exitoso</small>
                    <div class="small fw-bold mt-1 text-primary">Estado: En preparación</div>
                </div>
            </div>
            `;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newShippingHTML;
            
            // Insertar al inicio de la lista de envios (despues de los estáticos)
            // Ojo: shippingList contiene tambien los items estaticos y los links de abajo.
            // Lo ideal es insertar al principio.
            shippingList.insertBefore(tempDiv.firstElementChild, shippingList.firstChild);
            
            checkbox.closest('.cart-item').remove(); 
        });

        updateCartTotal();
        alert("¡Compra exitosa!");
        navigate('envios');
    });

    // 5. LÓGICA DE DIRECCIONES
    addressActionBtn.addEventListener('click', () => {
        newAddressForm.classList.toggle('d-none');
        document.querySelectorAll('.delete-addr-btn').forEach(btn => {
            btn.classList.toggle('d-none');
        });
    });

    saveAddressBtn.addEventListener('click', () => {
        const addressText = newAddressInput.value.trim();
        if(addressText) {
            const newRow = document.createElement('div');
            newRow.className = "d-flex align-items-center justify-content-between mb-2 address-item";
            newRow.innerHTML = `
                <div>
                    <input class="form-check-input me-2" type="checkbox">
                    <small>${addressText}</small>
                </div>
                <button class="btn btn-sm text-danger delete-addr-btn"><i class="bi bi-trash"></i></button>
            `;
            addressList.appendChild(newRow);
            newAddressInput.value = '';
        }
    });

    addressList.addEventListener('click', (e) => {
        if(e.target.classList.contains('delete-addr-btn') || e.target.closest('.delete-addr-btn')) {
             e.target.closest('.address-item').remove();
        }
    });

});

// 6. FUNCIÓN DE NAVEGACIÓN
function navigate(viewName) {
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => {
        view.classList.add('d-none');
    });

    const selectedView = document.getElementById(`view-${viewName}`);
    if (selectedView) {
        selectedView.classList.remove('d-none');
    }

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(viewName)) {
            btn.classList.add('active');
        }
    });

    window.scrollTo(0, 0);
}