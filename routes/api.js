'use strict';
const BoardModel = require("../models/model").Board
const ThreadModel = require("../models/model").Thread
const ReplyModel = require("../models/model").Reply

module.exports = function (app) {
  
  app.route('/api/threads/:board').post((req, res) => {
    const { text, delete_password } = req.body
    let board = req.body.board
    if(!board) {
      board = req.params.board
    }

    const newThread = new ThreadModel({
      text: text,
      delete_password: delete_password,
      replies: []
    })
    BoardModel.findOne({ name: board}, (err, Boarddata) => {
      if(!Boarddata) {
        const newBoard = new BoardModel({
          name: board,
          thread: []
        })
        newBoard.threads.push(newThread)
        newBoard.save((err, data) => {
          if(err || !data) {
            res.send("There was an error saving in post")
          } else {
            res.json(newThread)
          }
        })
      } else {
        Boarddata.threads.push(newThread)
        Boarddata.save((err, data) => {
          if(err || !data) {
            res.send("There was an error saving in post")
          } else {
            res.json(newThread)
          }
        }) 
      }
    })
  }).get((req, res) => {
    const board = req.params.board
    BoardModel.findOne( {name: board}, (err, data) => {
      if(!data) {
        res.json({error: "No board with this name"})
      } else {
        const threads = data.threads.map((thread) => {
          const {_id, text, created_on, bumped_on, delete_password, reported, replies} = thread
          return {_id, text, created_on, bumped_on, delete_password, reported, replies, replycount: thread.replies.length}
        })
        res.json(threads)
      }
    })
  }).put((req, res) => {
    const { thread_id } = req.body
    const board = req.params.board
    BoardModel.findOne({ name: board}, (err, boardData) => {
      if(!boardData) {
        res.send("Board not found")
      } else {
        const date = new Date()
        let reportedThread = boardData.threads.id(thread_id)
        reportedThread.reported = true
        reportedThread.bumped_on = date
        boardData.save((err, updateData) => {
          res.send("success")
        })
      }
    })
  }).delete((req, res) => {
    const { thread_id, delete_password } = req.body
    const board = req.params.board
    BoardModel.findOne( {name: board}, (err, boardData) => {
      if(!boardData) {
        res.send("Board not found")
      } else {
        let threadToDelete = boardData.threads.id(thread_id)
        if(threadToDelete.delete_password === delete_password) {
          threadToDelete.remove()
        } else {
          res.send("Incorrect Password")
          return
        }
        boardData.save((err, updatedData) => {
          res.send("success")
        })
      }
    })
  })
    
  app.route('/api/replies/:board').post((req, res) => {
    const { thread_id, text, delete_password } = req.body
    const board = req.params.board
    const newReply  = new ReplyModel({
      text: text,
      delete_password: delete_password
    })
    BoardModel.findOne({name: board}, (err, boardData) => {
      if(!boardData) {
        res.send("Board not found")
      } else {
        const date = new Date()
        let threadToAddReply = boardData.threads.id(thread_id)
        threadToAddReply.bumped_on = date
        threadToAddReply.replies.push(newReply)
        boardData.save((err, updatedData) => {
          res.json(updatedData)
        })
      }
    })
  }).get((req, res) => {
    const board = req.params.board
    BoardModel.findOne({name: board}, (err, boardData) => {
      if(!boardData) {
        res.json("Board not found")
      } else {
        const thread = boardData.threads.id(req.query.thread_id)
        res.json(thread)
      }
    })
  }).put((req, res) => {
    const { thread_id, reply_id } = req.body
    const board = req.params.board
    BoardModel.findOne({name: board}, (err, boardData) => {
      if(!boardData) {
        res.json("Board not found")
      } else {
        const date = new Date()
        const thread = boardData.threads.id(thread_id)
        const reply = thread.replies.id(reply_id)
        reply.reported = true
        reply.bumped_on = date
        boardData.save((err, updatedData) => {
          if(!err) {
            res.send("Success")
          }
        })
      }
    })
  }).delete((req, res) => {
    const { thread_id, reply_id, delete_password } = req.body
    const board = req.params.board
    BoardModel.findOne({name: board}, (err, boardData) => {
      if(!boardData) {
        return res.json("Board not found")
      } else {
        const thread = boardData.threads.id(thread_id)
        const reply = thread.replies.id(reply_id)
        if(reply.delete_password === delete_password) {
          reply.remove()
        } else {
          return res.send("Incorrect Password")
        }
        boardData.save((err, updatedData) => {
          if(!err) {
            return res.send("success")
          }
        })
      }
    })
  })

}
