// validate in client side

(() => {
    // 'use strict': 在严格模式下,JavaScript 引擎会执行更严格的语法检查,并且禁用了一些不安全或不推荐使用的语法和特性。
    'use strict'
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false)
    })
})();