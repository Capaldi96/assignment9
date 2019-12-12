$(document).ready(function(){
    // OM det finns en nyckel ladda katalogen!
    if ( localStorage.getItem("key") === null){
        $('#your-key').text('You have no key');
        $("#book-title").prop('disabled', true);
        $("#book-author").prop('disabled', true);
        $("#add-book").prop('disabled', true);
    }
    else if (localStorage.getItem("key").length !== 0) {
        let settings = {
            op: 'select',
            key: localStorage.getItem('key')
        }
        $('#your-key').text('Your key: '+ localStorage.getItem('key'));
        loopUrl(settings,0,loadCatalog);
    }
    $("#get-key").click(function(){
        loopUrl({keyRequest: true} ,0,storeKey)
    });

    // Lägg till bok och töm inputs
    $("#add-book").click(function(){
        if($("#book-title").val().length == 0 || $("#book-author").val().length == 0){
            let wentWrong = 'Fill in both title and author input!';
            let data = {
                status:'error',
                message:'Fill in both title and author input!'
            }
            failedOrSucceeded(data,wentWrong);
            return;
        }
        let settings = {
            op: 'insert',
            title: $("#book-title").val(),
            author: $("#book-author").val(),
            key: localStorage.getItem('key')
        }
        $('#book-title').val('');
        $('#book-author').val('');
        loopUrl(settings,0,addOneBook);
    });

    // ladda annan katalog om inte nyckel inputen är tom och inte samma som localstorage nyckeln
    $("#get-old-key").click(function(){
        if($("#old-key").val().length == 0 || $("#old-key").val() == localStorage.getItem('key')){
            let wentWrong = 'Empty key input or same as current key';
            let data = {
                status:'error'
            }
            failedOrSucceeded(data,wentWrong);
            return;
        }
        let settings = {
            op: 'select',
            key: $("#old-key").val()
        }
        loopUrl(settings,0,loadCatalog);
        $('#old-key').val('');    
    });

    // Vid tryck på X tabort bok
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
        input.on('keyup', function (e) {
            if(e.which == 13){
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
            }
            if(e.keyCode == 27){
                $(this).parent().children('.close-span').after($('<span class=\"title\"/>').html(old));
                $(this).remove();
            }
        });
        input.blur( function(){
            $(this).parent().children('.close-span').after($('<span class=\"title\"/>').html(old));
            $(this).remove();
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
        input.on('keyup', function (e) {
            if(e.keyCode == 13){
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
            }
            if(e.keyCode == 27){
                $(this).parent().children('.title').after($('<span class=\"author\"/>').html(old));
                $(this).remove();
            }
        });
        input.blur( function(){
            $(this).parent().children('.title').after($('<span class=\"author\"/>').html(old));
            $(this).remove();
        });
    });
  
});
//CALLBACK functions

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

function storeKey(data){
    if(data.status !== 'success'){
        let wentWrong = 'Failed saving key';
        failedOrSucceeded(data,wentWrong);
        return;
    }
    localStorage.setItem('key', data.key);
    $('#your-key').text('Your key: ' + localStorage.getItem('key'));
    $("#book-title").prop('disabled', false);
    $("#book-author").prop('disabled', false);
    $("#add-book").prop('disabled', false);
    $("#katalog").children().remove();
}

function saveKey(data,settings){
    if(data.status !== 'success'){
        let wentWrong = 'Failed saving key';
        failedOrSucceeded(data,wentWrong);
        return;
    }
    localStorage.setItem('key', settings.key);
    $("#book-title").prop('disabled', false);
    $("#book-author").prop('disabled', false);
    $("#add-book").prop('disabled', false);
    $('#your-key').text('Your key: '+ localStorage.getItem('key'));
    $('#katalog').children().remove();
}

function logError(data,count){
    $('.console-div').css('display','block');
    ++count;
    if(data.message == 'Server error!'){
        $('#console').append('<tr><td class=\"call\">'+count +'</td><td class=\"status\">' + data.status + '</td><td class=\"message\">' + data.message + '</td></tr><');
    }
    else{
        $('#console').append('<tr><td class=\"call\">'+count +'</td><td class=\"status\">' + data.status + '</td><td class=\"message\">' + data.message + '</td></tr><');
    }
    let rowpos = $('#console tr:last').position();
    $('.console-div').scrollTop(rowpos.top);
}

function failedOrSucceeded(data,message){
    if(data.status == 'error'){
        $('.error').text(message);
    }
    if(data.status == 'success')
        $('.error').text(message);
    $('.error').stop().fadeIn(400).delay(3000).fadeOut(400); //fade out after 3 seconds
}

function loadCatalog(data,settings){
    if(data.status !== 'success'){
        if(data.message == 'Bad API key, use "requestKey" to request a new one.'){
            $('#your-key').text('Bad API key');
            $("#book-title").prop('disabled', true);
            $("#book-author").prop('disabled', true);
            $("#add-book").prop('disabled', true);
            $('#katalog').children().remove();
            localStorage.removeItem('key');
        }
        let wentWrong = 'Error getting key';
        failedOrSucceeded(data,wentWrong);
    }
    if(data.status == 'success' && data.data.length !== 0){
        saveKey(data,settings);
        $('#katalog').children().remove();
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
    else{
        let catalog = document.getElementById("katalog");
        let bookElement = document.createElement("div");
        let titleElement = document.createElement("span");
        let authorElement = document.createElement("span");
        let closeButton = document.createElement("span");
        let closeIcon = document.createElement("i");
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
    else url += 'key=' + settings.key;          
    if(typeof settings.op !== 'undefined') url += '&op=' + settings.op;
    if(typeof settings.title !== 'undefined') url += '&title=' + encodeURIComponent(settings.title);
    if(typeof settings.author !== 'undefined') url += '&author=' + encodeURIComponent(settings.author);
    if(typeof settings.id !== 'undefined') url += '&id=' + encodeURIComponent(settings.id);
    $.get(url, function(data, status) {
        if(status == 'success'){ //web status
            data = JSON.parse(data);
        }
        else{
            let data = {
                message: 'Server error!',
                status: status
            }
            logError(data,count);
            return;
        }
        if (data.status != 'success') { // api status failed
            logError(data,count);
            if (++count < 5) loopUrl(settings, count ,callback);
            else callback(data,settings);
        }else{
            data.message = 'Api call succeeded';
            logError(data,count);
            callback (data,settings);
        }
    });
}
