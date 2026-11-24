// ModMenuの内容
const modmenu = new ModMenuFramework();

const mainMenu = new Menu();
mainMenu.title = "HatoMods";
mainMenu.menuId = "main";

const bodyMainMenu = document.createElement("div");

bodyMainMenu.innerHTML = `
<button id="openTeleporter">テレポーターを開く</button>
`

mainMenu.bodyElement = bodyMainMenu;

mainMenu.onOpenMenu = function () {
    document.getElementById("openTeleporter").addEventListener("click", () => {
        modmenu.openMenu('teleporter')
    })
}

modmenu.setMainMenu(mainMenu);

modmenu.openMainMenu();