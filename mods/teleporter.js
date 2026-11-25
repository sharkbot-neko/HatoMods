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
X: <input id="x" /><br>
Y: <input id="y" /><br>
<div style="display: flex; gap: 3px; justify-content: center;">
<button id="hato-teleport">テレポート</button>
<button id="hato-cursor-tp">カーソル追跡OFF</button>
</div>
    `

    teleporterMenu.bodyElement = bodyMainMenu;

    var refreshInterval;
    var cursorTpFlag = false;

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
        if (!document.getElementById("hatos")) return null;

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

        const cursorTpButton = document.getElementById("hato-cursor-tp");
        cursorTpButton.addEventListener("click", () => {
            cursorTpFlag = !cursorTpFlag;
            cursorTpButton.textContent = `カーソル追跡${cursorTpFlag ? "ON" : "OFF"}`

            if (cursorTpFlag) {
                alert("マウスの左ボタンを押し続けると鳩が移動します。")
            }
        })

        document.getElementById("myCanvas").addEventListener('mousemove', (e) => {
            if (!cursorTpFlag) return;
            const hatoId = getHatoId();
            if (hatoId == null) return;
            const isLeftPressed = (e.buttons & 1) === 1;
            if (!isLeftPressed) return;

            const rect = document.getElementById("myCanvas").getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            var hatoClass = hato[hatoId];
            hatoClass.x = x;
            hatoClass.y = y;
            hato[hatoId] = hatoClass
        });
    }

    teleporterMenu.onCloseMenu = function () {
        clearInterval(refreshInterval);
        cursorTpFlag = false;
    }

    modmenu.addMenu("teleporter", teleporterMenu);
}

registerTeleporter();