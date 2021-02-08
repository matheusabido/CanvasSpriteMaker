(() => {
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const color = document.querySelector('#color');
    const title = document.querySelector('h1');

    // {@} grid configuration

    const gridList = [];
    const gridPixels = 10;

    // grid configuration {@}

    let paintedGrids = [];
    let previousGrids = [];

    let pressing = false;
    let button = 0;

    let currentGrid = null;
    
    let virtualMachine = {
        'loadEvents': () => {
            color.oninput = () => title.style.color = color.value;

            document.getElementById('saveButton').addEventListener('click', () => {
                virtualMachine.copiar();
            });

            document.addEventListener('mousedown', event => {
                pressing = true
                button = event.button;
            });
            document.addEventListener('mouseup', event => {
                pressing = false;
                button = 0;
            });

            canvas.onmousemove = event => {
                virtualMachine.render();
                let mousePosition = virtualMachine.getMousePosition(event);
                for (grid of gridList) {
                    if (mousePosition.x >= grid.leftX && mousePosition.x <= grid.rightX && mousePosition.y <= grid.downY && mousePosition.y >= grid.upY) {
                        context.fillStyle = "#7070708c";
                        context.fillRect(grid.leftX, grid.upY, gridPixels, gridPixels);
                        currentGrid = grid;
                        break;
                    }
                }
                if (pressing && button === 0) virtualMachine.paint();
                if (pressing && button === 2) virtualMachine.erase();
            }

            canvas.onclick = () => virtualMachine.paint();
            canvas.addEventListener('contextmenu', event => {
                event.preventDefault();
                virtualMachine.erase();
            });
        },
        'loadGrids': () => {
            for (let y = 1; y <= canvas.height / gridPixels; y++) {
                for (let x = 1; x <= canvas.width / gridPixels; x++) {
                    let leftX = (x - 1) * gridPixels;
                    let rightX = x * gridPixels;
                    let upY = (y - 1) * gridPixels;
                    let downY = y * gridPixels;
                    gridList.push({'leftX': leftX, 'rightX': rightX, 'upY': upY, 'downY': downY});
                }
            }
        },
        'render': () => {
            context.clearRect(0, 0, 600, 600);
            for (paintedGrid of paintedGrids) {
                context.fillStyle = paintedGrid.color;
                context.fillRect(paintedGrid.grid.leftX, paintedGrid.grid.upY, gridPixels, gridPixels);
            }

            for (paintedGrid of previousGrids) {
                context.fillStyle = paintedGrid.color;
                context.fillRect(paintedGrid.grid.leftX, paintedGrid.grid.upY, gridPixels, gridPixels);
            }
        },
        'hasGrid': grid => {
            for (g of paintedGrids) if (grid === g.grid) return true;
            return false;
        },
        'paint': () => {
            if (currentGrid !== null && !virtualMachine.hasGrid(currentGrid)) {
                let colorValue = color.value;
                context.fillStyle = colorValue;
                context.fillRect(currentGrid.leftX, currentGrid.upY, gridPixels, gridPixels);
                paintedGrids.push({'grid': currentGrid, 'color': colorValue});
            }
        },
        'erase': () => {
            if (currentGrid !== null) {
                for (grid of paintedGrids) {
                    if (grid.grid === currentGrid) {
                        paintedGrids.splice(paintedGrids.indexOf(grid), 1);
                        context.fillStyle = "#fff";
                        context.fillRect(grid.grid.leftX, grid.grid.upY, gridPixels, gridPixels);
                        break;
                    }
                }
            }
        },
        'getMousePosition': event => {
            let width = document.body.clientWidth;
            let x = event.pageX - width / 2 + canvas.width / 2;
            let y = event.pageY - canvas.offsetTop;
            return {'x': x, 'y': y};
        },
        'copiar': () => {
            let code = document.getElementById('code');
            virtualMachine.salvar(code);
            code.select();
            code.setSelectionRange(0, 99999);
            document.execCommand("copy");
            alert('Copiado.');
        },
        'salvar': code => {
            let minX = 601;
            let minY = 601;
            for (coloredGrid of paintedGrids) {
                if (coloredGrid.grid.leftX < minX) minX = coloredGrid.grid.leftX;
                if (coloredGrid.grid.upY < minY) minY = coloredGrid.grid.upY;
            }
    
            let pg = paintedGrids;
    
            for (coloredGrid of pg) {
                coloredGrid.grid.leftX -=  minX;
                coloredGrid.grid.rightX -= minX;
                coloredGrid.grid.upY -= minY;
                coloredGrid.grid.downY -= minY;
            }
    
            let cd = '{"grids":[';
    
            for (coloredGrid of pg) {
                cd += `{"color": "${coloredGrid.color}", "grid": [${coloredGrid.grid.leftX}, ${coloredGrid.grid.upY}]},`;
            }
    
            cd = cd.substring(0, cd.length - 1) + ']}';
    
            code.value = cd;
    
            previousGrids = paintedGrids.splice(0, paintedGrids.length);
    
            for (coloredGrid of previousGrids) {
                coloredGrid.color = `${coloredGrid.color}8c`;
                coloredGrid.grid.leftX += minX;
                coloredGrid.grid.rightX += minX;
                coloredGrid.grid.upY += minY;
                coloredGrid.grid.downY += minY;
            }
    
            virtualMachine.render();
        }
    }
    virtualMachine.loadGrids();
    virtualMachine.loadEvents();
})();