function registerTeleporter() {
    const teleporterMenu = new Menu();
    teleporterMenu.title = "テレポーター";
    teleporterMenu.menuId = "teleporter";

    const bodyMainMenu = document.createElement("div");

    bodyMainMenu.innerHTML = `
    <label>鳩を選択→</label>
    <select id="hatos">
    <option value="" selected>選択してください</option>
    </select><br>
    X: <input id="x" /><br>Y: <input id="y" /><br><button id="hato-teleport">テレポート</button>
    `

    teleporterMenu.bodyElement = bodyMainMenu;

    var refreshInterval;

    function refreshMain() {
        const hatos = document.getElementById("hatos");

        hatos.replaceChildren();

        for( i=0; i<pmax; i++ ){
            if( !hato[i].exist ) continue;
            const option = new Option(`ID:${i} X:${Math.floor(hato[i].x)} Y:${Math.floor(hato[i].y)}`, `${i}`);
            hatos.add(option);
        }
    }

    function getHatoId() {
        return Number(document.getElementById("hatos").value)
    }

    teleporterMenu.onOpenMenu = function () {
        refreshInterval = setInterval(() => {
            refreshMain();
        }, 1000)

        document.getElementById("hato-teleport").addEventListener("click", () => {
            const hatoId = getHatoId();
            var hatoClass = hato[hatoId];
            hatoClass.x = Number(document.getElementById("x").value);
            hatoClass.y = Number(document.getElementById("y").value);
            hato[hatoId] = hatoClass
        })
    }

    teleporterMenu.onCloseMenu = function () {
        clearInterval(refreshInterval);
    }

    modmenu.addMenu("teleporter", teleporterMenu);
}

registerTeleporter();