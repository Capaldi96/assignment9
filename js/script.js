
$(document).ready(function(){

    // OM det finns en nyckel ladda katalogen!
    if (localStorage.getItem("key").length !== 0) {
        let settings = {
            op: 'select',
            key: localStorage.getItem('key')
        }   
        loopUrl(settings,0,loadCatalog);
    }

    $("#get-key").click(function(){
        loopUrl({keyRequest: true} ,0,saveKey)
    });
    // Lägg till bok om töm inputs
    $("#add-book").click(function(){
        let settings = {
            op: 'insert',
            title: $("#book-title").val(),
            author: $("#book-author").val()
        }
        $('#book-title').val('');
        $('#book-author').val('');
        loopUrl(settings,0,addOneBook);
    });

    $("#get-old-key").click(function(){
        let settings = {
            op: 'select',
            key: localStorage.setItem('key' , $("#old-key").val())
        }
        loopUrl(settings,0,loadCatalog);
    });
    $("body").on('click', '.close', function(elem){
        let settings = {
            op: 'delete',
            key: localStorage.getItem('key'),
            id: $(this).parent().attr('id')
        }
        loopUrl(settings,0,deleteBook);
    });
    //MODIFY TITLE
    $("body").on('click', '.title', function () {
        let input = $('<input />', {
            'type': 'text',
            'class': 'input-title',
            'value': $(this).text()
        });
        let old = $(this).text();
        $(this).parent().children('.close-span').after(input);
        $(this).remove();
        input.focus();
        input.blur( function () {
            $(this).parent().children('.close-span').after($('<span class=\"title\"/>').html($(this).val()));
            let settings = {
                op: 'update',
                key: localStorage.getItem('key'),
                id: $(this).parent().attr('id'),
                title: $(this).parent().children('.title')[0].innerText,
                oldTitle: old,
                author: $(this).parent().children('.author')[0].innerText
            }
            $(this).remove();
            loopUrl(settings,0,modifyBook);
        });
    });


    // MODIFY AUTHOR
    $("body").on('click','.author', function () {
        let input = $('<input />', {
            'type': 'text',
            'class': 'input-author',
            'value': $(this).text()
        });
        let old = $(this).text();
        $(this).parent().children('.title').after(input);
        $(this).remove();
        input.focus();
        input.blur( function () {
            $(this).parent().children('.title').after($('<span class=\"author\"/>').html($(this).val()));
            let settings = {
                op: 'update',
                key: localStorage.getItem('key'),
                id: $(this).parent().attr('id'),
                title: $(this).parent().children('.title')[0].innerText,
                author: $(this).parent().children('.author')[0].innerText,
                oldAuthor: old
            }
            $(this).remove();
            loopUrl(settings,0,modifyBook);
        });
    });
    function modifyBook(book,settings){
        if(book.status !== 'success'){
            let wentWrong = 'Modify book failed';
            if(settings.oldTitle !== 'undefined'){
                $(".title").text(settings.oldTitle);
            }
            if(settings.oldAuthor !== 'undefined'){
                $(".author").text(settings.oldAuthor);
            }
            failedOrSucceeded(book,wentWrong);
        }
        else{
            let wentRight = 'Modify book succeeded';
            failedOrSucceeded(book,wentRight);
        }
    }

    function deleteBook(book,settings){
        if(book.status !== 'success'){
            let wentWrong = 'Deleting book failed';
            failedOrSucceeded(book,wentWrong);
        }
        else{
            let wentRight = 'Deleting book succeeded';
            $("#" + settings.id).remove();
            failedOrSucceeded(book,wentRight);
        }
    }
    function saveKey(data){
        if(data.status !== 'success'){
            let wentWrong = 'Failed getting a key';
            failedOrSucceeded(data,wentWrong);
        }
        else{
            localStorage.setItem('key', data.key);
            let keySpan = $("<span id=\"key\" class=\"text-center\"></span>").text("This is your key: " + data.key)
            $("#get-key").after(keySpan);
            $("#get-key").remove();
            let wentRight = 'Succeeded getting a key';
            failedOrSucceeded(data,wentRight);
        }
    }
    function failedOrSucceeded(data,message){
        if(data.status == 'error')
            $('.error').text(message);
        if(data.status == 'success')
            $('.error').text(message);
        $('.error').stop().fadeIn(400).delay(3000).fadeOut(400); //fade out after 3 seconds
    }
    function loadCatalog(data){
        if(data.status !== 'success'){
            let wentWrong = 'Loading catalog failed';
            failedOrSucceeded(data,wentWrong);
        }
        if(data.status == 'success' && data.data.length !== 0){
            data.data.forEach(element => {
                buildBook(element);
            });
            let wentRight = 'Loading catalog succeeded';
            failedOrSucceeded(data,wentRight);
        }
    }
    function buildBook(book){
        if(book.title.length !== 0 || book.author.length !== 0){
            let catalog = document.getElementById("katalog");
            let bookElement = document.createElement("div");
            let titleElement = document.createElement("span");
            let authorElement = document.createElement("span");
            let closeButton = document.createElement("span");
            let closeIcon = document.createElement("i");
            closeIcon.setAttribute('class', 'close fa fa-window-close');
            closeButton.setAttribute('class', 'close-span');
            closeButton.setAttribute('id', book.id);
            bookElement.setAttribute('class', 'book');
            bookElement.setAttribute('id', book.id);
            titleElement.setAttribute('class', 'title');
            titleElement.innerText = book.title;
            authorElement.setAttribute('class', 'author');
            authorElement.innerText = book.author;
            closeButton.appendChild(closeIcon);
            bookElement.appendChild(closeButton);
            bookElement.appendChild(titleElement);
            bookElement.appendChild(authorElement);
            catalog.appendChild(bookElement);
        }

    }
    function addOneBook(data, settings){
        if(data.status !== 'success'){
            let wentWrong = 'Failed adding book, try again';
            failedOrSucceeded(data,wentWrong);
        }
        if(settings.title.length == 0 || settings.author.length == 0){
            let wentWrong = 'Fill in both title and author input!'
            failedOrSucceeded(data,wentWrong);
        }
        else{
            let catalog = document.getElementById("katalog");
            let bookElement = document.createElement("div");
            let titleElement = document.createElement("span");
            let authorElement = document.createElement("span");
            let closeButton = document.createElement("span");
            let closeIcon = document.createElement("i");
            let modifyIcon = document.createElement("i");
            closeIcon.setAttribute('class', 'close fa fa-window-close');
            closeButton.setAttribute('class', 'close-span');
            closeButton.setAttribute('id', data.id);
            bookElement.setAttribute('class', 'book');
            bookElement.setAttribute('id', data.id);
            titleElement.setAttribute('class', 'title');
            titleElement.innerText = settings.title;
            authorElement.setAttribute('class', 'author');
            authorElement.innerText = settings.author;
            closeButton.appendChild(closeIcon);
            bookElement.appendChild(closeButton);
            bookElement.appendChild(titleElement);
            bookElement.appendChild(authorElement);
            catalog.appendChild(bookElement);
            let wentRight = 'Added book to catalog';
            failedOrSucceeded(data,wentRight);
        }
    }
    function loopUrl(settings,count,callback) {
        const apiUrl = 'https://www.forverkliga.se/JavaScript/api/crud.php?';
        url = apiUrl ;
        if(typeof settings.keyRequest !== 'undefined') url += 'requestKey';
        else url += 'key=' + localStorage.getItem('key');          
        if(typeof settings.op !== 'undefined') url += '&op=' + settings.op;
        if(typeof settings.title !== 'undefined') url += '&title=' + encodeURIComponent(settings.title);
        if(typeof settings.author !== 'undefined') url += '&author=' + encodeURIComponent(settings.author);
        if(typeof settings.id !== 'undefined') url += '&id=' + encodeURIComponent(settings.id);
        console.log(url);   
        $.get(url, function(data, status) {
            if(status == 'success'){ //web status
                data = JSON.parse(data);
            }
            else{
                console.log('failed! count: ', count);
                if (++count < 5) loopUrl(settings, count ,callback);
                else callback(data,settings);
            }
            if (data.status != 'success') { // api status
                console.log('failed! count: ', count);
                if (++count < 5) loopUrl(settings, count ,callback);
                else callback(data,settings);
            }else callback (data,settings);
        });
    }
});