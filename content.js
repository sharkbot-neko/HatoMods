// ModMenuの内容
const modmenu = new ModMenuFramework();

const mainMenu = new Menu();
mainMenu.title = "HatoMods";
mainMenu.menuId = "main";

mainMenu.allowMaximize = false;
mainMenu.initialSize = { width: 300, height: 200 }
mainMenu.initialPosition = { left: 100, top: 100 }

const bodyMainMenu = document.createElement("div");

bodyMainMenu.innerHTML = `
<span>鳩関連↓</span><br>
<button id="openTeleporter">テレポーター</button>
`

mainMenu.bodyElement = bodyMainMenu;

mainMenu.onOpenMenu = function () {
    document.getElementById("openTeleporter").addEventListener("click", () => {
        modmenu.openMenu('teleporter')
    })
}

modmenu.setMainMenu(mainMenu);

modmenu.openMainMenu();

const overlay = document.createElement("div");
overlay.className = "overlay-div";
overlay.textContent = "鳩Mod";
overlay.addEventListener("click", () => {
    modmenu.openMainMenu();
})
document.body.appendChild(overlay)