const forms = document.querySelector(".forms")
const pwShowHide = document.querySelectorAll(".eye-icon")
const links = document.querySelectorAll(".link");
const error = document.getElementById('error')
const email = document.getElementById('email')
const password = document.getElementById('password')
const confirmPassword = document.getElementById('confirmPassword')
const username = document.getElementById('username')

pwShowHide.forEach(eyeIcon => {
  eyeIcon.addEventListener("click", () => {
    let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");
    let confirmPwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".confirmPassword");

    pwFields.forEach(password => {
      if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.replace("bx-hide", "bx-show");
        return;
      }
      password.type = "password";
      eyeIcon.classList.replace("bx-show", "bx-hide");
    })

    confirmPwFields.forEach(password => {
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

  const xhr = new XMLHttpRequest()

  xhr.open('POST', '/auth/register')
  xhr.responseType = 'json'
  xhr.setRequestHeader('Content-Type', 'application/json')

  const body = JSON.stringify({
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    username: username.value
  })

  xhr.send(body)

  //triggers when the request cannot be made.
  xhr.onerror = function () {
    console.log(xhr.response)
  }

  //triggers when the response is fully downloaded.
  xhr.onload = function () {
    if (xhr.status == 201) {
      loginroute()
    } else {
      error.innerHTML = `<b>${xhr.response.msg ?? ""}</b>`
    }
  }
})

function loginroute() {
  error.innerHTML = ""
  email.value = ""
  password.value = ""
  username.value = ""
  confirmPassword.value = ""
  location.href = "/auth/login"
}
