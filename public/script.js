    const $ = document.querySelector.bind(document);
    const socket = io('https://caro-room.herokuapp.com');
    // var user = "{{user}}", room = "{{room}}";
    const caroBoard = $('.caro-board');
    var limited;
    var time = 16

    socket.emit('connected', { user, room })
    socket.on('friend-out', () => {
        clearBoard();
        socket.emit('friend-out');
    })



    socket.on('competitor', (nameCompetitor) => {
        clearBoard();
        $('#competitor-name').textContent = nameCompetitor;
        socket.emit('friend-in', user);
    })
    socket.on('reply', (nameCompetitor) => {
        $('#competitor-name').textContent = nameCompetitor;
    })

    //{{!--CARO BOARD--}}


    function clearBoard() {
        var crossWord = document.querySelectorAll('.cross-word');
        crossWord.forEach(item => {
            item.textContent = '';
        })
    }

    var turn = false;
    function handleHit() {

        let row = this.getAttribute('row');
        let col = this.getAttribute('col');
        socket.emit('hit', row, col);
        socket.on('friend-turn', () => {
            $('.my-turn').textContent = '';

            if (turn) {
                clearInterval(limited)

                let remainingTime = time;
                $('.your-turn').textContent = remainingTime;
                limited = setInterval(() => {
                    remainingTime--;
                    if (remainingTime <= 0) {
                        $('.your-turn').textContent = '';
                        clearInterval(limited)
                    }
                    $('.your-turn').textContent = remainingTime;
                }, 1000);
                turn = false;
            }
        })


    }

    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            let crossWord = document.createElement('div');
            crossWord.classList.add('cross-word')
            crossWord.setAttribute('row', i);
            crossWord.setAttribute('col', j);
            caroBoard.appendChild(crossWord);
        }

    }


    var listCrossWord = [...document.getElementsByClassName('cross-word')];
    listCrossWord.forEach((item, index) => {
        item.addEventListener('click', handleHit)
    })


    socket.on('my-turn', () => {
        turn = true;
        clearInterval(limited)
        let remainingTime = time;
        $('.your-turn').textContent = '';
        $('.my-turn').textContent = remainingTime;
        limited = setInterval(() => {
            remainingTime--;
            $('.my-turn').textContent = remainingTime;
            if (remainingTime <= 0) {
                $('.my-turn').textContent = '';
                clearInterval(limited)
            }
        }, 1000)
    })


    socket.on('auto-hit', (row, col) => {
        socket.emit('hit', row, col);
        $('.my-turn').textContent = '';
        clearInterval(limited)

        let remainingTime = time;
        $('.your-turn').textContent = remainingTime;
        limited = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                $('.your-turn').textContent = '';
                clearInterval(limited)
            }
            $('.your-turn').textContent = remainingTime;
        }, 1000)
    })


    socket.on('next-caro', (row, col, data) => {
        var crossWord = $(`div[row="${row}"][col="${col}"]`);
        crossWord.textContent = data;
        if (data == 'x') {
            crossWord.style.color = 'blue';
        } else {
            crossWord.style.color = 'red';
        }
    })

    let remaining = document.querySelectorAll('.remaining-time');
    socket.on('win', win => {
        socket.emit('end');
        $('.box-announced').style.display = 'block';
        remaining.forEach((item) => {
            item.style.display = 'none'
        })
        clearInterval(limited);

        if (win == 'no win or lose') {
            $('.announced').style.color = 'green';
            $('.announced').textContent = 'Hòa';
            return;
        }

        if (win) {
            $('.announced').style.color = 'red';
            $('.announced').textContent = 'win';
        }
        else {
            $('.announced').style.color = 'black';
            $('.announced').textContent = 'lose';
        }
    })

    $('.btn-announced').onclick = function () {
        remaining.forEach((item) => {
            item.style.display = 'block'
            item.textContent='';
        })
        $('.box-announced').style.display = 'none';
        clearBoard();
        socket.emit('clear');
    }


    //DRAW

    $('#btn-draw').onclick = function () {
        if ($('.my-turn').textContent != '')
            socket.emit('draw');
    }

    socket.on('draw please', () => {
        let acceptDraw = document.createElement('div');
        let accept = document.createElement('div');
        let cancel = document.createElement('div');
        acceptDraw.classList.add('accept-draw');
        accept.classList.add('btn-draw');
        accept.textContent = 'chấp nhận';
        cancel.classList.add('btn-draw');
        cancel.textContent = 'hủy';
        acceptDraw.innerHTML = '<h2 style = "display: block;">Đối phương xin hòa</h2>';
        acceptDraw.append(cancel, accept);

        accept.onclick = () => {
            socket.emit('accept draw');
            acceptDraw.remove();
        }
        cancel.onclick = () => {
            acceptDraw.remove();
        }
        $('body').append(acceptDraw);

        setTimeout(() => {
            acceptDraw.remove();
        }, 5000)
    });


    //Chat

    let myMessage = null;
    let message = null;

    function handleSubmit() {
        clearTimeout(myMessage);
        var text = $('#txtData').value;
        $('#txtData').value = '';
        let p = document.getElementsByClassName('myMessage');
        p[0].style.display = 'block';
        p[0].textContent = text

        myMessage = setTimeout(() => {
            p[0].style.display = 'none';
        }, 6000);

        socket.emit('client-sent-data', { user, room, text });
    }

    $('#btnSubmit').onclick = handleSubmit;

    socket.on('server-sent-data', function (data) {
        clearTimeout(message);
        let p = document.getElementsByClassName('message');
        p[0].style.display = 'block';
        p[0].textContent = data.text;
        message = setTimeout(() => {
            p[0].style.display = 'none';
        }, 6000);
    });

    $('#txtData').onkeypress = function (e) {
        if (e.key == 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    }
