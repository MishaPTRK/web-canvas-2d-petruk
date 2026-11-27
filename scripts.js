const board = document.querySelector("canvas");
const pen = board.getContext("2d");
const brushWidthInput = document.querySelector('input[type="range"]');
const inkColorInput = document.querySelector('input[type="color"]');

const allBtns = document.querySelectorAll("button");
const modeButtons = {
    draw: allBtns[0],
    erase: allBtns[1],
    stamp: allBtns[2],
    undo: allBtns[3],
    clear: allBtns[4]
};

const CANVAS_BG = "#ffffff";
const HISTORY_LIMIT = 30;

let activeTool = "draw";
let painting = false;
let steps = [];

function ResetBoard()
{
    pen.fillStyle = CANVAS_BG;
    pen.fillRect(0, 0, board.width, board.height);
}

function SwitchTool(toolName) 
{
    activeTool = toolName;

    modeButtons.draw.classList.toggle("active", toolName === "draw");
    modeButtons.erase.classList.toggle("active", toolName === "erase");
}

function CalcCoords(e) 
{
    const rect = board.getBoundingClientRect();

    const x = (e.clientX - rect.left) * (board.width / rect.width);
    const y = (e.clientY - rect.top) * (board.height / rect.height);

    return { x, y };
}

function RecordStep() 
{
    steps.push(pen.getImageData(0, 0, board.width, board.height));

    if (steps.length > HISTORY_LIMIT)
    {
        steps.shift();
    }
}

function RevertStep()
{
    const lastSnapshot = steps.pop();

    if (lastSnapshot)
    {
        pen.putImageData(lastSnapshot, 0, 0);
    }
}

function WipeBoard()
{
    RecordStep();
    ResetBoard();
}

function ApplyStrokeSettings() 
{
    pen.lineWidth = Number(brushWidthInput.value);
    pen.lineCap = "round";
    pen.strokeStyle = activeTool === "erase" ? CANVAS_BG : inkColorInput.value;
}

function BeginStroke(e)
{
    RecordStep();

    const { x, y } = CalcCoords(e);

    board.setPointerCapture(e.pointerId);

    painting = true;
    ApplyStrokeSettings();

    pen.beginPath();
    pen.moveTo(x, y);
    pen.lineTo(x, y);
    pen.stroke();
}

function ContinueStroke(e)
{
    if (!painting)
    {
        return;
    }

    const { x, y } = CalcCoords(e);
    pen.lineTo(x, y);
    pen.stroke();
}

function EndStroke()
{
    painting = false;
}

modeButtons.draw.addEventListener("click", () => SwitchTool("draw"));
modeButtons.erase.addEventListener("click", () => SwitchTool("erase"));
modeButtons.undo.addEventListener("click", () => RevertStep());
modeButtons.clear.addEventListener("click", () => WipeBoard());

board.addEventListener("pointerdown", (e) => BeginStroke(e));
board.addEventListener("pointermove", (e) => ContinueStroke(e));
board.addEventListener("pointerup", () => EndStroke());
board.addEventListener("pointercancel", () => EndStroke());

ResetBoard();