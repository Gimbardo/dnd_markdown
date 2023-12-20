
function handle_scrolling() {
  SHEETS = {
    nav: document.querySelector("#nav_sheets"),
    link: document.querySelector("#sheets")
  }

  MONSTERS = {
    nav: document.querySelector("#nav_monsters"),
    link: document.querySelector("#monsters")
  }

  ADVENTURES = {
    nav: document.querySelector("#nav_adventures"),
    link: document.querySelector("#adventures")
  }

  document.querySelectorAll(".articles").forEach((section) => {
    section.style.display = "none"
  })

  activate(SHEETS)

  SHEETS['nav'].addEventListener('click', (button) => {
    activate(SHEETS)
    deactivate(MONSTERS)
    deactivate(ADVENTURES)
  })

  MONSTERS['nav'].addEventListener('click', (button) => {
    activate(MONSTERS)
    deactivate(SHEETS)
    deactivate(ADVENTURES)
  })

  MONSTERS['nav'].addEventListener('click', (button) => {
    deactivate(SHEETS)
    activate(MONSTERS)
    deactivate(ADVENTURES)
  })

  ADVENTURES['nav'].addEventListener('click', (button) => {
    deactivate(SHEETS)
    deactivate(MONSTERS)
    activate(ADVENTURES)
  })

}

function activate(elem) {
  elem["nav"].classList.add("active")
  elem["link"].style.display = "grid"
}

function deactivate(elem) {
  elem["nav"].classList.remove("active")
  elem["link"].style.display = "none"
}