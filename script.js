/***********************
 * GRID + CLUES
 ***********************/

const gridLayout = [
  [1,1,1,0,1,1,1,1,1],
  [1,0,0,1,1,1,1,1,1],
  [1,0,1,1,1,1,0,1,0],
  [1,1,1,0,1,1,1,0,1],
  [1,1,1,1,1,0,1,1,1],
  [1,1,0,0,1,1,1,1,1],
  [1,1,1,0,1,0,0,1,1],
  [1,1,1,0,1,1,1,1,1],
  [1,1,0,0,0,1,1,1,1],
  [1,0,0,1,1,1,1,0,1]
];

// Manually assign numbers to specific cells [row, col]: number
const clueNumbers = {
  '0,0': 1, '0,4': 2, '0,5':3, '0,6':4, '0,7':5, '0,8':6,
  '1,3':7,
  '2,2':8,
  '3,0':9, '3,1':10, '3,4':11, '3,6':12, '3,8':13,
  '4,0':14, '4,6':15, '4,7':16, 
  '5,0':17, '5,4':18,
  '6,0':19, '6,2':20, '6,7':21,
  '7,0':22, '7,4':23, '7,5':24, '7,6':25,
  '8,0':26, '8,5':27,
  '9,3':28
};

const clues = {
  across: {
    1: "Type of ring, in a way",
    2: "Boo!",
    7: "Later!",
    8: "Testament/Final Document",
    9: "Blue, Purple, Black, many!",
    11: "Fitting",
    14: "Parking attendant",
    15: "abbr. yearly investment returns",
    17: "abbr. Before dating when you used to wait for me you'd always say 'working ___'",
    18: "Oppositely charged, in a way",
    19: "Prefix used with gender",
    21: "Sober Group",
    22:"5th or Park (abbr.)",
    23: "What RSVPs are asked for",
    26: "You always have so many of these girlies in your groups (abbr.)",
    27: "Silly shoes",
    28: "Happy kitty"
  },
  down: {
    1: "Ambiguous language",
    2: "Jelly setting agent (British spelling)",
    3: "Lend a hand",
    4: "Typical Yiddish expression '___ gevalt!'",
    5: "Plant seeds",
    6: "Et ___ Brute",
    7: "Yeeeess in Spanish",
    8: "idk if this this real but, keyboard with no windows key (abbr.)",
    10: "Local, Original, in a way",
    12: "$\\frac{\\sin{\\cdot}}{\\cos{\\cdot}}$",
    13: "Extra fishies in the net",
    16: "Keys on Campus",
    20: "(abbr.) Direction from NYC to Florida",
    24: "Old media player",
    25: "(abbr.) be human!"
  }
};

const grid = document.getElementById("grid");
const acrossList = document.getElementById("across-clues");
const downList = document.getElementById("down-clues");

let direction = "across";
let currentClue = null;

/***********************
 * BUILD GRID
 ***********************/

gridLayout.forEach((row, r) => {
  row.forEach((cell, c) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.dataset.row = r;
    div.dataset.col = c;

    if (cell === 0) {
      div.classList.add("black");
    } else {
      if (clueNumbers[`${r},${c}`]) {
        const numDiv = document.createElement("div");
        numDiv.classList.add("number");
        numDiv.textContent = clueNumbers[`${r},${c}`];
        div.appendChild(numDiv);
      }

      const input = document.createElement("input");
      input.maxLength = 1;

      input.addEventListener("focus", () => {
        highlightWord(r, c);
        setActiveClue(r, c);
      });

      input.addEventListener("input", e => handleInput(e, r, c));
      input.addEventListener("keydown", e => handleKey(e, r, c));

      div.appendChild(input);
    }

    grid.appendChild(div);
  });
});

/***********************
 * RENDER CLUES
 ***********************/

function renderClues() {
  for (const dir of ["across", "down"]) {
    const container = dir === "across" ? acrossList : downList;
    container.innerHTML = "";

    for (const num in clues[dir]) {
      const li = document.createElement("li");
      li.id = `${dir}-${num}`;
      li.innerHTML = `${num}. ${clues[dir][num]}`; // Changed from textContent to innerHTML
      li.classList.add("clue");
      
      li.addEventListener("click", () => {
        direction = dir;
        // Find cell with this number and focus it
        for (const [key, value] of Object.entries(clueNumbers)) {
          if (value === parseInt(num)) {
            const [r, c] = key.split(',').map(Number);
            const cellIndex = r * 9 + c;
            const input = grid.children[cellIndex].querySelector('input');
            if (input) input.focus();
            break;
          }
        }
      });
      
      container.appendChild(li);
    }
  }
  
  // Typeset LaTeX after rendering clues
  if (window.MathJax) {
    MathJax.typesetPromise([acrossList, downList]).catch((err) => console.log(err));
  }
}

renderClues();

/***********************
 * ACTIVE CLUE
 ***********************/

function setActiveClue(r, c) {
  // Find the start of the current word
  let startR = r, startC = c;
  
  if (direction === "across") {
    while (startC > 0 && gridLayout[startR][startC - 1] === 1) {
      startC--;
    }
  } else {
    while (startR > 0 && gridLayout[startR - 1][startC] === 1) {
      startR--;
    }
  }
  
  const num = clueNumbers[`${startR},${startC}`];
  if (!num) return;

  document.querySelectorAll(".clue").forEach(el =>
    el.classList.remove("active")
  );

  const el = document.getElementById(`${direction}-${num}`);
  if (el) {
    el.classList.add("active");
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  currentClue = num;
}

/***********************
 * HIGHLIGHT WORD
 ***********************/

function highlightWord(r, c) {
  document.querySelectorAll(".cell").forEach(cell =>
    cell.classList.remove("active")
  );

  let dr = direction === "across" ? 0 : 1;
  let dc = direction === "across" ? 1 : 0;

  // Go back to start of word
  while (r - dr >= 0 && c - dc >= 0 && gridLayout[r - dr]?.[c - dc] === 1) {
    r -= dr;
    c -= dc;
  }

  // Highlight the word
  while (r < 10 && c < 9 && gridLayout[r]?.[c] === 1) {
    const cellIndex = r * 9 + c;
    grid.children[cellIndex].classList.add("active");
    r += dr;
    c += dc;
  }
}

/***********************
 * INPUT HANDLER
 ***********************/

function handleInput(e, r, c) {
  if (e.target.value) {
    e.target.value = e.target.value.toUpperCase();
    // Move to next cell
    moveToNextCell(r, c);
  }
}

/***********************
 * MOVE TO NEXT CELL
 ***********************/

function moveToNextCell(r, c) {
  let nr = r, nc = c;
  
  // Move in current direction
  if (direction === "across") {
    nc++;
  } else {
    nr++;
  }
  
  // Find next white cell, skipping black squares
  while (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
    if (gridLayout[nr][nc] === 1) {
      const nextInput = grid.children[nr * 9 + nc].querySelector("input");
      if (nextInput) {
        nextInput.focus();
        return;
      }
    }
    // Keep moving in same direction
    if (direction === "across") {
      nc++;
    } else {
      nr++;
    }
  }
}

/***********************
 * MOVE TO PREVIOUS CELL
 ***********************/

function moveToPreviousCell(r, c) {
  let nr = r, nc = c;
  
  // Move backwards in current direction
  if (direction === "across") {
    nc--;
  } else {
    nr--;
  }
  
  // Find previous white cell, skipping black squares
  while (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
    if (gridLayout[nr][nc] === 1) {
      const prevInput = grid.children[nr * 9 + nc].querySelector("input");
      if (prevInput) {
        prevInput.focus();
        prevInput.value = ''; // Clear the previous cell
        return;
      }
    }
    // Keep moving backwards
    if (direction === "across") {
      nc--;
    } else {
      nr--;
    }
  }
}

/***********************
 * KEYBOARD
 ***********************/

function handleKey(e, r, c) {
  let nr = r, nc = c;

  if (e.key === "Backspace") {
    // If current cell is empty, go to previous cell
    if (!e.target.value) {
      e.preventDefault();
      moveToPreviousCell(r, c);
    }
    // If current cell has value, just delete it (default behavior)
    return;
    
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    direction = "across"; 
    nc++;
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    direction = "across"; 
    nc--;
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    direction = "down"; 
    nr++;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    direction = "down"; 
    nr--;
  } else if (e.key === " ") {
    // Toggle direction
    e.preventDefault();
    direction = direction === "across" ? "down" : "across";
    highlightWord(r, c);
    setActiveClue(r, c);
    return;
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    // Let the input event handle letter typing and moving
    return;
  } else {
    return;
  }

  // Navigate with arrow keys - skip black squares
  while (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
    if (gridLayout[nr][nc] === 1) {
      const nextInput = grid.children[nr * 9 + nc].querySelector("input");
      if (nextInput) {
        nextInput.focus();
      }
      break;
    }
    // Keep moving in arrow direction
    if (e.key === "ArrowRight") nc++;
    else if (e.key === "ArrowLeft") nc--;
    else if (e.key === "ArrowDown") nr++;
    else if (e.key === "ArrowUp") nr--;
    else break;
  }
}

// Focus first cell on load
setTimeout(() => {
  const firstInput = document.querySelector('.cell input');
  if (firstInput) firstInput.focus();
}, 100);