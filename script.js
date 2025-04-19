 const SERVER_URL = 'https://Devs404paK.pythonanywhere.com';
        let debounceTimer;

        // Función para mostrar mensajes
        function showMessage(message, isError = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'user-message';
            messageDiv.style.backgroundColor = isError ? '#ff4444' : '#00C851';
            messageDiv.textContent = message;
            
            document.body.appendChild(messageDiv);
            
            setTimeout(() => {
                messageDiv.style.opacity = '0';
                setTimeout(() => messageDiv.remove(), 500);
            }, 3000);
        }

        // Función para hacer peticiones
        async function makeRequest(url, method, data) {
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(responseData.error || 'Error en la solicitud');
                }

                return responseData;
            } catch (error) {
                throw error;
            }
        }

        // Validación en tiempo real para username
        document.getElementById('registerName').addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            const username = e.target.value.trim();
            
            if (username.length < 3) {
                updateFieldStatus('registerName', 'El nombre de usuario debe tener al menos 3 caracteres', false);
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const response = await fetch(`${SERVER_URL}/users`);
                    const data = await response.json();
                    const usernameExists = data.users.some(user => user.username === username);
                    
                    if (usernameExists) {
                        updateFieldStatus('registerName', 'El nombre de usuario ya está en uso', false);
                    } else {
                        updateFieldStatus('registerName', 'Nombre de usuario disponible', true);
                    }
                } catch (error) {
                    updateFieldStatus('registerName', 'Error verificando disponibilidad', false);
                }
            }, 500);
        });

        // Validación en tiempo real para email
        document.getElementById('registerEmail').addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            const email = e.target.value.trim();
            
            // Validación básica de formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                updateFieldStatus('registerEmail', 'Ingresa un email válido', false);
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const response = await fetch(`${SERVER_URL}/users`);
                    const data = await response.json();
                    const emailExists = data.users.some(user => user.email === email);
                    
                    if (emailExists) {
                        updateFieldStatus('registerEmail', 'El correo electrónico ya está registrado', false);
                    } else {
                        updateFieldStatus('registerEmail', 'Correo electrónico disponible', true);
                    }
                } catch (error) {
                    updateFieldStatus('registerEmail', 'Error verificando email', false);
                }
            }, 500);
        });

        // Actualizar estado del campo
        function updateFieldStatus(fieldId, message, isValid) {
            const field = document.getElementById(fieldId);
            let statusElement = field.nextElementSibling;
            
            if (!statusElement || !statusElement.classList.contains('field-status')) {
                statusElement = document.createElement('div');
                statusElement.className = 'field-status';
                field.parentNode.insertBefore(statusElement, field.nextSibling);
            }
            
            statusElement.textContent = message;
            statusElement.style.color = isValid ? '#4CAF50' : '#F44336';
            
            if (isValid) {
                field.style.border = '1px solid #4CAF50';
            } else {
                field.style.border = '1px solid #F44336';
            }
        }

        // Registrar usuario
        document.getElementById('registerBtn').addEventListener('click', async () => {
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value.trim();

            // Validación básica en el cliente
            if (!name || !email || !password) {
                showMessage('Todos los campos son obligatorios', true);
                return;
            }

            if (name.length < 3) {
                showMessage('El nombre de usuario debe tener al menos 3 caracteres', true);
                return;
            }

            if (password.length < 6) {
                showMessage('La contraseña debe tener al menos 6 caracteres', true);
                return;
            }

            // Verificar si hay mensajes de error visibles
            const errorMessages = document.querySelectorAll('.field-status');
            const hasErrors = Array.from(errorMessages).some(el => 
                el.style.color === 'rgb(244, 67, 54)' || 
                el.textContent.includes('ya está') ||
                el.textContent.includes('inválido')
            );

            if (hasErrors) {
                showMessage('Corrige los errores en el formulario antes de enviar', true);
                return;
            }

            try {
                const data = await makeRequest(`${SERVER_URL}/register`, 'POST', {
                username: name,
                email: email,
                password: password
                });

                showMessage('Usuario registrado. Revisa tu correo para el código de verificación.');
                document.getElementById('registerForm').reset();
                
                // Cambiar al formulario de login
                document.getElementById('container').classList.remove('active');
                
                // Limpiar estados de validación
                document.querySelectorAll('.field-status').forEach(el => el.remove());
                document.getElementById('registerName').style.border = '';
                document.getElementById('registerEmail').style.border = '';
            } catch (error) {
                showMessage(error.message, true);
                console.error('Error en registro:', error);
            }
        });

        // Iniciar sesión
        document.getElementById('loginBtn').addEventListener('click', async () => {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!username || !password) {
                showMessage('Usuario y contraseña son obligatorios', true);
                return;
            }

            try {
                const data = await makeRequest(`${SERVER_URL}/login`, 'POST', {
                    username,
                    password
                });

                showMessage(`¡Bienvenido ${data.user.username}! Sesión iniciada correctamente`);
                document.getElementById('loginForm').reset();
            } catch (error) {
                showMessage(error.message, true);
                console.error('Error en login:', error);
            }
        });

        // Alternar entre formularios
        document.getElementById('registerToggle').addEventListener('click', () => {
            document.getElementById('container').classList.add('active');
        });

        document.getElementById('loginToggle').addEventListener('click', () => {
            document.getElementById('container').classList.remove('active');
        });