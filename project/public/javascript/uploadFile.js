
const form = document.querySelector("form");
const fileInput = document.querySelector(".file-input");
const progressArea = document.querySelector(".progress-area");
const uploadedArea = document.querySelector(".uploaded-area");
const errorField = document.querySelector('#error')
let xhr;

form.addEventListener("click", () => {
  fileInput.click();
});

fileInput.onchange = async ({ target }) => {
  let files = target.files;
  let names = null
  let filenames = Object.values(files)

  if (filenames.length >= 1) {
    names = filenames.map(({ name }) => {
      if (name.length >= 30) {
        let splitName = name.split('.');
        name = splitName[0].substring(0, 30) + "... ." + splitName[1];
        return `<p>${name}</p>`
      }

      return `<p>${name}</p>`
    })

    names = names.join(" ")

    await showProgress(names);

  } else {
    let fileName;
    if (filenames[0].name) {
      fileName = filenames[0].name;
      if (fileName.length >= 30) {
        let splitName = fileName.split('.');
        fileName = splitName[0].substring(0, 30) + "... ." + splitName[1];
      } else {
        let splitName = fileName.split('.');
        fileName = splitName[0].substring(0, 30) + "... ." + splitName[1];
      }


    }
    await showProgress(fileName ?? filenames[0]);

  }


  uploadFile()
  // xhr = null

}

async function uploadFile() {
  let data = new FormData(form);

  xhr.send(data);

  xhr.onload = function () {
    if (xhr.status != 200) {
      window.location = '/auth/login'
    }
  }
}

async function showProgress(name) {
  xhr = new XMLHttpRequest();
  xhr.open("POST", '/files/upload');
  xhr.setRequestHeader('Authorization', `Bearer ${JSON.parse(localStorage.getItem('token'))}`)
  xhr.responseType = 'json'

  xhr.upload.addEventListener("progress", ({ loaded, total }) => {
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1024);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB";
    let progressHTML = `<li class="row">
                          <i class="fas fa-file-alt"></i>
                          <div class="content">
                            <div class="details">
                            <div class="name">${name} <p>  <small>status: uploading... </small> </p></div>
                              <span class="percent">${fileLoaded}%</span>
                            </div>
                            <div class="progress-bar">
                              <div class="progress" style="width: ${fileLoaded}%"></div>
                            </div>
                          </div>
                        </li>`;
    uploadedArea.classList.add("onprogress");
    progressArea.innerHTML = progressHTML;
    if (loaded == total) {
      progressArea.innerHTML = "";
      let uploadedHTML = `<li class="row">
                            <div class="content upload">
                              <i class="fas fa-file-alt"></i>
                              <div class="details">
                                <div class="name">${name} <p>  <small>status: uploaded </small> </p></div>
                                <span class="size">${fileSize}</span>
                              </div>
                            </div>
                            <i class="fas fa-check"></i>
                          </li>`;
      uploadedArea.classList.remove("onprogress");
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    }
  });
}