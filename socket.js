class socket {
    connect(app) {
        const server = app.listen(process.env.PORT || 3000);
        const io = require('socket.io')(server);

        var listRoom = [];
        var boards = {};
        var turn = {};
        function addPerson(data) {
            for (let i of listRoom) {
                if (i.name == data.room) {
                    i.person = 2;
                    return 2;
                }
            }
            listRoom.push(
                {
                    name: data.room,
                    person: 1
                }
            )
            return 1;
        }


        function leaveRoom(room) {
            for (let i = 0; i < listRoom.length; i++) {
                if (listRoom[i].name == room && listRoom[i].person == 1) {
                    listRoom.splice(i, 1);
                    delete turn[room];
                    return;
                }
                if (listRoom[i].name == room && listRoom[i].person == 2) {
                    listRoom[i].person = 1;
                    return 1;
                }
            }
        }

        function checkWin(arr, user, r, c) {
            let row = parseInt(r);
            let col = parseInt(c);
            var count = 0;
            // check Horizontal
            let i = 0;
            let ok = 0;
            while (col + i < 20) {
                if (arr[row][col + i] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }


            i = -1;
            while (col + i >= 0) {
                if (arr[row][col + i] == user) {
                    count++;
                    i--;
                }
                else {
                    if (arr[row][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }



            if (count >= 4 && ok == 1) return true;


            // check vertical
            i = 0;
            ok = 0;
            count = 0;
            while (row + i < 20) {
                if (arr[row + i][col] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row + i][col] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break
                };
            }

            i = -1;
            while (row + i >= 0) {
                if (arr[row + i][col] == user) {
                    count++;
                    i--;
                }
                else {
                    if (arr[row + i][col] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }
            if (count >= 4) return true;

            // check cross row \
            i = 0;
            ok = 0;
            count = 0;
            while (row + i < 20 && col + i < 20) {
                if (arr[row + i][col + i] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row + i][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }

            i = -1;
            while (row + i >= 0 && col + i >= 0) {
                if (arr[row + i][col + i] == user) {
                    count++;
                    i--;
                }
                else {
                    if (arr[row + i][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }

            if (count >= 4) return true;

            // check cross row /
            i = 0;
            ok = 0;
            count = 0;
            while (row + i < 20 && col - i >= 0) {
                if (arr[row + i][col - i] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row + i][col - i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }

            i = 1;
            while (row - i >= 0 && col + i < 20) {
                if (arr[row - i][col + i] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row - i][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }

            if (count >= 4) return true;

            return false;
        }

        function clearBoard(board) {
            let l = board.length;
            for (let i = 0; i < l; i++) {
                board.shift();
                board.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
        }

        

        io.on('connection', socket => {
            var boardCaro = [];
            for (let i = 0; i < 20; i++) {
                boardCaro.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
            var room;
            var you;
            var autoHit = null;

            clearTimeout(autoHit);

            socket.on('connected', data => {
                clearTimeout(autoHit);
                socket.join(data.room);
                you = addPerson(data);
                room = data.room
                boards[room] = boardCaro;
                turn[room] = 1;
                socket.to(room).emit('competitor',data.user);
            })


            function randomHit(you, room){
                while(true){
                    let row = Math.round(Math.random()*19);
                    let col = Math.round(Math.random()*19);
                    if(boards[room][row][col] == 0){
                        socket.to(room).emit('auto-hit', row, col);
                        break;
                    }
                }
                clearTimeout(autoHit); // chac chan

            }

               
            function hit(row,col){
                if (turn[room] != you) return;
                var data = you == 1 ? 'x' : 'o';
                if (boards[room][row][col] == 0) {

                    clearTimeout(autoHit);
                    clearTimeout(autoHit); // chac chan

                    socket.to(room).emit('my-turn');
                    io.in(room).emit('next-caro', row, col, data);
                    boards[room][row][col] = you;
                    if (checkWin(boards[room], you, row, col)) {
                        socket.emit('win', true)
                        socket.to(room).emit('win', false);
                        clearBoard(boards[room]);
                        clearTimeout(autoHit);
                        turn[room] = you == 1 ? 2 : 1;
                        turn[room]= -turn[room];
                        return;
                    };

                    turn[room] = you == 1 ? 2 : 1;

                    autoHit = setTimeout(()=>{
                        randomHit(turn[room],room);
                    },16000)
                }
            }
            
            


            // hit caro
            socket.on('hit', hit )

            socket.on('end',()=>{
                clearTimeout(autoHit);
            })

            socket.on('clear',()=>{
                turn[room] = Math.abs(turn[room]);
                clearTimeout(autoHit);
                clearBoard(boards[room]);
            })



            socket.on('friend-in',(nameCompetitor)=>{
                clearTimeout(autoHit);
                clearBoard(boards[room]);
                socket.to(room).emit('reply',nameCompetitor)
            })


            socket.on('friend-out', () => {
                you = 1;
                turn[room] = you;
                clearTimeout(autoHit);
                clearBoard(boards[room]);
            })

            // Chat
            socket.on('client-sent-data', data => {
                socket.to(data.room).emit('server-sent-data', data);
            });



            socket.on('disconnect', () => {
                you = leaveRoom(room);
                socket.to(room).emit('friend-out');
            })

        })
    }

}

module.exports = new socket();