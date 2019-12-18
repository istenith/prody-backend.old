window.addEventListener("load", () => {
    var mobileWindow = window.matchMedia("(max-width: 700px)");
    let navbar = document.getElementById("navbar");

    var tabs = document.querySelectorAll(".tab");

    var previouslyActive = tabs[0];
    setActiveTab(tabs[1]);

    document.querySelector("header").style.height = tabs[0].offsetHeight + "px";

    tabs.forEach(tab => {
        tab.addEventListener("click", setContent);
    });

    //tab buttons working
    function setContent(eve) {
        setActiveTab(eve.target);
    }

    function setActiveTab(tab) {
        if (tab != previouslyActive) {
            // update active tab
            previouslyActive.classList.remove("active");
            tab.classList.add("active");

            // center tab
            if (mobileWindow.matches) {
                navbar.style.transform = `translateX(${window.innerWidth / 2 -
                    (tab.offsetWidth / 2 + tab.offsetLeft)}px)`;
            }

            document.getElementById(tab.dataset.toggles).classList.add("active");
            document
                .getElementById(previouslyActive.dataset.toggles)
                .classList.remove("active");
            previouslyActive = tab;
        }
    }

    {
        let events = document.querySelectorAll("#events .card");
        events.forEach(event => {
            event.addEventListener("click", eve => {
                eve.target.classList.toggle("turned");
            });
        });
    }
    {
        // geting canvas by id c
        let c = document.getElementById("matrix-effect");
        let ctx = c.getContext("2d");

        //making the canvas full screen
        c.height = window.innerHeight;
        c.width = window.innerWidth;

        //chinese characters - taken from the unicode charset
        let matrix = "TEAM ISTE";
        //converting the string into an array of single characters
        matrix = matrix.split("");

        let font_size = 21;
        let columns = c.width / font_size; //number of columns for the rain
        //an array of drops - one per column
        let drops = [];
        //x below is the x coordinate
        //1 = y co-ordinate of the drop(same for every drop initially)
        for (let x = 0; x < columns; x++) drops[x] = 1;

        //drawing the characters
        function draw() {
            //Black BG for the canvas
            //translucent BG to show trail
            ctx.fillStyle = "rgba(24, 24, 24, 0.14)";
            ctx.fillRect(0, 0, c.width, c.height);

            ctx.fillStyle = "#0F6"; //green text
            ctx.font = font_size + "px montserrat";
            //looping over drops
            for (let i = 0; i < drops.length; i++) {
                //a random chinese character to print
                let text = matrix[Math.floor(Math.random() * matrix.length)];
                //x = i*font_size, y = value of drops[i]*font_size
                ctx.fillText(text, i * font_size, drops[i] * font_size);

                //sending the drop back to the top randomly after it has crossed the screen
                //adding a randomness to the reset to make the drops scattered on the Y axis
                if (drops[i] * font_size > c.height && Math.random() > 0.975)
                    drops[i] = 0;

                //incrementing Y coordinate
                drops[i]++;
            }
        }

        setInterval(draw, 50);
    }
});

window.addEventListener("keydown", event => {
    var tabs = document.querySelectorAll(".tab");
    var mobileWindow = window.matchMedia("(max-width: 700px)");
    var previouslyActive = document.querySelector(".tab.active");
    let previouslyActiveIndex = 0;
    tabs.forEach(function (element, index) {
        if (element === previouslyActive) {
            previouslyActiveIndex = index;
        }
    });
    function setActiveTab(tab) {
        if (tab != previouslyActive) {
            // update active tab
            previouslyActive.classList.remove("active");
            tab.classList.add("active");

            // center tab
            if (mobileWindow.matches) {
                navbar.style.transform = `translateX(${window.innerWidth / 2 -
                    (tab.offsetWidth / 2 + tab.offsetLeft)}px)`;
            }

            document.getElementById(tab.dataset.toggles).classList.add("active");
            document
                .getElementById(previouslyActive.dataset.toggles)
                .classList.remove("active");
            previouslyActive = tab;
        }
    }
    switch (event.code) {
        case "ArrowRight":
            if (previouslyActiveIndex != tabs.length - 1) {
                setActiveTab(tabs[previouslyActiveIndex + 1]);
            } else {
                setActiveTab(tabs[0]);
            }
            break;
        case "ArrowLeft":
            if (previouslyActiveIndex != 0) {
                setActiveTab(tabs[previouslyActiveIndex - 1]);
            } else {
                setActiveTab(tabs[tabs.length - 1]);
            }
            break;
        default:
            break;
    }
});
