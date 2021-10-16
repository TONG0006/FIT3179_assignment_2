var openings = ["reti_opening", "kings_indian_defence", "queens_indian_defence", "nimzo_indian_defence", "nimzowitsch_defence", "grunfeld_defence", "bogo_indian_defence", "old_indian_defence", "catalan_opening", "kings_indian_attack", "alekhines_defence", "modern_defence", "pirc_defence", "larsens_opening", "english_opening"];

function hide_all_openings() {
    openings.forEach((item, index) => {
        document.getElementById(item).hidden = true;
        document.getElementById("hypermodern_openings").children[index].setAttribute("class", "list-group-item list-group-item-dark");
        document.getElementById("hypermodern_openings").children[index].setAttribute("aria-disabled", false);
    });
};

function show_opening(index) {
    hide_all_openings();
    document.getElementById(openings[index]).hidden = false;
    document.getElementById("hypermodern_openings").children[index].setAttribute("class", "list-group-item list-group-item-dark active disabled");
    document.getElementById("hypermodern_openings").children[index].setAttribute("aria-disabled", true);
}

function on_load() {
    hide_all_openings();
    show_opening(0);
}