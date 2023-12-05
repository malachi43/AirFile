const forms = document.querySelector(".forms")
const pwShowHide = document.querySelectorAll(".eye-icon")
const links = document.querySelectorAll(".link")
let email = document.getElementById('email')
let password = document.getElementById('password')
const error = document.getElementById('error')

pwShowHide.forEach(eyeIcon => {
  eyeIcon.addEventListener("click", () => {
    let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");

    pwFields.forEach(password => {
      if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.replace("bx-hide", "bx-show");
        return;
      }
      password.type = "password";
      eyeIcon.classList.replace("bx-show", "bx-hide");
    })

  })
})

forms.addEventListener('submit', async function (e) {
  e.preventDefault()

  const pw = password.value
  const userEmail = email.value

  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/auth/login')
  xhr.responseType = 'json'
  xhr.setRequestHeader('Content-Type', 'application/json')

  const body = JSON.stringify({ email: userEmail, password: pw })

  xhr.send(body)

  xhr.onerror = function () {
    console.log(xhr.response)
  }

  xhr.onload = function () {
    if (xhr.status == 200) {
      localStorage.setItem('token', JSON.stringify(xhr.response.token))

      fileUpload()
    } else {
      error.innerHTML = `<b>${xhr.response.msg ?? ""}</b>`
    }
  }


})

function fileUpload() {
  error.innerHTML = ""
  email.value = ""
  password.value = ""
  location.href = '/files/upload'
}
