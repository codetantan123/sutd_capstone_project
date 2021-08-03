// initial values
let currentComic = 2;
let displayNumber = 3;
let timerId;

/**
 * Returns an array of comic numbers that should be displayed,
 * e.g. currentComic = 1, displayNumber = 3, will return array [2475, 1, 2]
 * @param {number} currentComic - selected comic number
 * @param {number} displayNumber - number of comics to display per page
 * @return {Array} - the array of comic numbers to load
 */
function getComicNumbers(currentComic, displayNumber) {
    const processNumber = (n) => {
        if (n > 2475) {
            return n - 2475;
        } else if (n < 1) {
            return 2475 + n;
        }
        return n;
    };

    let comicNumbers = [currentComic];
    if (displayNumber === 5) {
        comicNumbers = [
            currentComic - 2,
            currentComic - 1,
            currentComic,
            currentComic + 1,
            currentComic + 2
        ];
    } else if (displayNumber === 3) {
        comicNumbers = [currentComic - 1, currentComic, currentComic + 1];
    }
    let processedComicNumbers = comicNumbers.map((x) => processNumber(x));
    return processedComicNumbers;
}

/**
 * Inserts the image and title DOMS into the placeholder divs after finish fetching the data,
 * then calls the displayComics function
 * @param {number} currentComic - selected comic number
 * @param {number} displayNumber - number of comics to display per page
 * @return {void}
 */
async function updateComicPage(currentComic, displayNumber) {
    const insertTitle = (parentDivId, title) => {
        let titleDiv = document.getElementById(parentDivId);
        titleDiv.innerHTML = title;
    };

    const insertImg = (parentDivId, data) => {
        let imgDiv = document.getElementById(parentDivId);
        imgDiv.innerHTML = ""; // clear any existing image
        let img = document.createElement("img");
        img.alt = data.alt;
        img.src = data.img;
        imgDiv.appendChild(img);
    };

    const insertIndexNumber = (parentDivId, number) => {
        let numberDiv = document.getElementById(parentDivId);
        numberDiv.innerHTML = number;
    };

    let comicNumbers = getComicNumbers(currentComic, displayNumber);
    console.log("updateComicPage", comicNumbers);

    const comicData = await Promise.all(
        // consolidate multiple API calls into 1 promise
        comicNumbers.map(async (comicNumber) => {
            const res = await fetch(`https://xkcd.vercel.app/?comic=${comicNumber}`);
            return res.json();
        })
    );

    comicData.map((data, index) => {
        insertTitle(`comic-title-${index + 1}`, data.title);
        insertImg(`comic-img-${index + 1}`, data);
        insertIndexNumber(`comic-index-${index + 1}`, data.num);
    });

    displayComics();
}

/**
 * Loads the previous set of comics
 * e.g. current display set [1, 2, 3], previous set would be [2473, 2474, 2475]
 * @return {void}
 */
function loadPrevComics() {
    removeSearchedComicNumber();
    displayLoading();
    currentComic -= displayNumber;
    updateComicPage(currentComic, displayNumber);
}

/**
 * Loads the next set of comics
 *  * e.g. current display set [1, 2, 3], next set would be [4, 5, 6]
 * @return {void}
 */
function loadNextComics() {
    removeSearchedComicNumber();
    displayLoading();
    currentComic += displayNumber;
    updateComicPage(currentComic, displayNumber);
}

/**
 * Loads random set of comics by generating a random integer
 * @return {void}
 */
function loadRandomComics() {
    removeSearchedComicNumber();
    displayLoading();

    const getRandomIntInclusive = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    currentComic = getRandomIntInclusive(1, 2475);
    updateComicPage(currentComic, displayNumber);
}

/**
 * Allows user to press 'enter' upon entering a comic number
 * This will simulate a click on the 'Go' button
 * @return {void}
 */
function enterSearch() {
    if (event.keyCode === 13) {
        document.getElementById("search-button").click();
    }
}

/**
 * Goes to the comic number that is entered by user,
 * displays error message if number is invalid
 * @return {void}
 */
function goToComicNo() {
    let comicNo = document.getElementById("search-box").value;
    console.log("goToComicNo", comicNo);
    if (isNaN(comicNo) || comicNo < 1 || comicNo > 2475) {
        let errorMsg = document.querySelector("#error-bar");
        errorMsg.classList.remove("hidden");
    } else {
        displayLoading();
        currentComic = +comicNo;
        updateComicPage(currentComic, displayNumber);
    }
}

/**
 * Changes the number of comics to be displayed per page when user selects from the drop-down list
 * @return {void}
 */
function changeDisplayNumber() {
    displayLoading();
    let dropdownValue = document.getElementById("comic-no-dropdown").value;
    console.log("changeDisplayNumber", displayNumber);
    displayNumber = +dropdownValue;

    let comicSection = document.getElementById("comic-section");
    comicSection.innerHTML = "";
    for (const i of Array.from({ length: displayNumber }, (_, i) => i + 1)) {
        let newDiv = `<div id="comic-tile-${i}" class="comic-tile">
                            <div id="comic-title-${i}" class="comic-title"></div>
                            <div id="comic-img-${i}" class="comic-img"></div>
                            <div id="comic-index-${i}" class="comic-index"></div>
                        </div>`;
        comicSection.innerHTML += newDiv;
    }
    updateComicPage(currentComic, displayNumber);
}

/**
 * Displays the loading gif, hides the error message and comics
 * @return {void}
 */
function displayLoading() {
    clearTimeout(timerId);
    // document.getElementById("search-box").value = "";
    let errorMsg = document.querySelector("#error-bar");
    errorMsg.classList.add("hidden");
    let section = document.querySelector("#comic-section");
    section.classList.add("hidden");
    let loading = document.querySelector("#loading-bar");
    loading.classList.remove("hidden");
}

/**
 * Removes previously searched comic number to allow users enter a new search
 * @return {void}
 */
function removeSearchedComicNumber() {
    document.getElementById("search-box").value = "";
}

/**
 * Hides the loading gif and displays the comics,
 * Waits 1.5s before displaying the comics
 * @return {void}
 */
function displayComics() {
    const showComics = () => {
        let loading = document.querySelector("#loading-bar");
        loading.classList.add("hidden");
        let comicSection = document.querySelector("#comic-section");
        comicSection.classList.remove("hidden");
    };
    timerId = setTimeout(showComics, 1500);
}

// event listeners
document
    .getElementById("prev-button")
    .addEventListener("click", loadPrevComics);
document
    .getElementById("random-button")
    .addEventListener("click", loadRandomComics);
document
    .getElementById("next-button")
    .addEventListener("click", loadNextComics);
document.getElementById("search-box").addEventListener("keydown", enterSearch);
document.getElementById("search-button").addEventListener("click", goToComicNo);
document
    .getElementById("comic-no-dropdown")
    .addEventListener("change", changeDisplayNumber);

// page first load
updateComicPage(currentComic, displayNumber);



