const {ipcRenderer} = require('electron')
const axios = require('axios')
const moment = require('moment')

var auth = null
var chatHistorySelector = $('#chatHistory')
var authUserSidebarNameSelector = $('#authUserSidebarNameSelector')
var logoutButton = $('#logoutButton')
var groupsSelector = $('#groupsSelector')
var selectedGroupIdSelector = $("#selected_group_id");
var messagesSelector = $("#messages");
var groupsTitleSelector = $("#groupsTitle");
var createGroupIconSelector = $("#createGroupIcon");
var CreateGroupModalSelector = $("#CreateGroupModal");
var createGroupFormSelector = $("#createGroupForm");
var createGroupButtonSelector = $("#createGroupButton");
var newGroupNameSelector = $("#newGroupName");

$.getJSON('env.json', (env) => {
    auth = env.auth
})

var socket = io('http://192.168.2.31:3800')
socket.on('connect', function (data) {
    console.log('connected')
})
socket.on('event', function (data) {})
socket.on('disconnect', function () {})

socket.on('re-send-message', function (data) {
    messagesSelector.append('' +
        '<li class="left clearfix">\n' +
        '    <img style="bottom: 10px" class="user_pix" src="assets/images/avatar.jpg" alt="avatar">' +
        '    <div class="message">' +
        '        <span>' + data.message.message + '</span>' +
        '    </div>' +
        '    <span class="data_time">' + data.sender.name + ' - ' + moment(new Date(data.message.created_at)).format('YYYY-MM-DD, HH:mm') + '</span>' +
        '</li>' +
        '');
    chatHistorySelector.scrollTop(chatHistorySelector[0].scrollHeight);
})

socket.on('re-create-group', function (group) {
    groupsSelector.append('' +
        '<li class="">' +
        '    <a href="#" data-id="' + group.id + '" class="groupChatTitle" style="font-size:13px; margin-left: 15px">' +
        '        <span>#' + group.name + '</span>' +
        '    </a>' +
        '</li>' +
        '');
})

$(document).delegate('.groupChatTitle', 'click', function (element) {
    var group_id = $(this).data('id')
    if (selectedGroupIdSelector.val() != $(this).data('id')) {
        selectedGroupIdSelector.val(group_id)

        $('.groupChatTitle').parent().removeClass('active')
        $(this).parent().addClass('active')

        socket.emit('join_group', {
            user: auth.user,
            group_id: group_id
        })


        axios.get('http://192.168.2.31:8000/api/v1/group/messages', {
            params: {
                group_id: group_id
            }
        }).then((response) => {
            if (response.data.progress_code === "A000") {
                messagesSelector.html('')
                $.each(response.data.content, function (message) {
                    messagesSelector.append('' +
                        '<li class="left clearfix">' +
                        '    <img style="bottom: 10px" class="user_pix" src="assets/images/avatar.jpg" alt="avatar">' +
                        '    <div class="message">' +
                        '        <span>' + response.data.content[message].message + '</span>' +
                        '    </div>\n' +
                        '    <span class="data_time">' + response.data.content[message].sender.name + ' - ' + moment(new Date(response.data.content[message].created_at)).format('YYYY-MM-DD, HH:mm') + '</span>' +
                        '</li>' +
                        '');
                });
                chatHistorySelector.scrollTop(chatHistorySelector[0].scrollHeight);
            }
        }, (error) => {
            console.log(error);
        });
    }
});

$("#message").keydown(function (event) {
    if (event.keyCode === 13) {
        var group_id = $("#selected_group_id").val()
        var message = $(this).val()
        console.log('test')
        socket.emit('send-message', {
            receiver_id: group_id,
            receiver_type: 'App\\Models\\ChatGroup',
            sender_id: auth.user.id,
            sender_type: 'App\\Models\\' + auth.user.model,
            message: message
        })
    }
}).keyup(function (event) {
    if (event.keyCode === 13) {
        $(this).val(null)
    }
});

logoutButton.click(function () {
    ipcRenderer.send('logout', {});
});

groupsTitleSelector.on('mouseover', function () {
    createGroupIconSelector.show()
})

groupsTitleSelector.on('mouseout', function () {
    createGroupIconSelector.hide()
})

createGroupIconSelector.on('click', function () {
    CreateGroupModalSelector.modal('show')
})

createGroupButtonSelector.on('click', function () {
    socket.emit('create-group', newGroupNameSelector.val())
    createGroupFormSelector.trigger('reset')
    CreateGroupModalSelector.modal('hide')
})

$(document).ready(function () {
    authUserSidebarNameSelector.html('<strong>' + auth.user.name + '</strong>');

    axios.get('http://192.168.2.31:8000/api/v1/group/index')
        .then((response) => {
            if (response.data.progress_code === "A000") {
                $.each(response.data.content, function (group) {
                    groupsSelector.append('' +
                        '<li class="">' +
                        '    <a href="#" data-id="' + response.data.content[group].id + '" class="groupChatTitle" style="font-size:13px; margin-left: 15px">' +
                        '        <span>#' + response.data.content[group].name + '</span>' +
                        '    </a>' +
                        '</li>' +
                        '');
                });
            }
        }, (error) => {
            console.log(error);
        });
    // $("#chatBody").hide();
})
