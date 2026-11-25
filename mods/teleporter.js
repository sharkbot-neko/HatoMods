function registerTeleporter() {
    const teleporterMenu = new Menu();
    teleporterMenu.title = "テレポーター";
    teleporterMenu.menuId = "teleporter";
    teleporterMenu.allowMaximize = false;
    teleporterMenu.initialSize = { width: 300, height: 200 }
    teleporterMenu.initialPosition = { left: 130, top: 130 }

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

        const hatoValue = hatos.value;

        hatos.replaceChildren();

        for( i=0; i<pmax; i++ ){
            if( !hato[i].exist ) continue;
            const option = new Option(`ID:${i} X:${Math.floor(hato[i].x)} Y:${Math.floor(hato[i].y)}`, `${i}`);
            hatos.add(option);
        }

        hatos.value = hatoValue;
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