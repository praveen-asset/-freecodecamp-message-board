const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let testThreadId;
let testReplyId;
suite('Functional Tests', function() {
    suite('5 functions test', function() {
        test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
            chai.request(server).post('/api/threads/testboard').set('content-type', 'application/json')
            .send({ text: "testing", delete_password: "123"})
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body.text, 'testing')
                assert.equal(res.body.delete_password, '123')
                assert.equal(res.body.reported, false)
                testThreadId = res.body._id
                done()
            })
        })
        test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
            chai.request(server)
            .get('/api/threads/testboard')
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body[0], 'There is a thread')
                assert.equal(res.body[0].text, 'testing')
                done()
            })
        })
        test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function(done) {
            chai.request(server).delete('/api/threads/testboard').set('content-type', 'application/json')
            .send({ thread_id: testThreadId, delete_password: "test"})
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body.text, 'Incorrect Password')
                done()
            })
        })
        test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
            chai.request(server).put('/api/threads/testboard').set('content-type', 'application/json')
            .send({ report_id: testThreadId})
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body.text, 'success')
                done()
            })
        })
        test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
            chai.request(server).post('/api/replies/testboard').set('content-type', 'application/json')
            .send({ thread_id: testThreadId, text: "testing reply", delete_password: "123reply"})
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body.threads[0].replies[0].text, 'testing reply')
                testReplyId = res.body.threads[0].replies[0]._id
                done()
            })
        })
        test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
            chai.request(server).get('/api/replies/testboard').set('content-type', 'application/json')
            .query({ thread_id: testThreadId })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body._id, testThreadId)
                assert.equal(res.body.text, 'testing')
                assert.equal(res.body.replies[0].text, 'testing reply')
                done()
            })
        })
        test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function(done) {
            chai.request(server).delete('/api/replies/testboard').set('content-type', 'application/json')
            .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: "tesdfsdfd" })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body._id, testThreadId)
                assert.equal(res.body.text, 'Incorrect Password')
                done()
            })
        })
        test('Reporting a reply: PUT request to /api/replies/{board}', function(done) {
            chai.request(server).put('/api/replies/testboard').set('content-type', 'application/json')
            .send({ thread_id: testThreadId, reply_id: testReplyId })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body._id, testThreadId)
                assert.equal(res.text, 'Success')
                done()
            })
        })
        test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function(done) {
            chai.request(server).delete('/api/replies/testboard').set('content-type', 'application/json')
            .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: "123reply" })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body._id, testThreadId)
                assert.equal(res.body.text, 'Success')
                done()
            })
        })
        test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function(done) {
            chai.request(server).delete('/api/threads/testboard').set('content-type', 'application/json')
            .send({ thread_id: testThreadId, delete_password: "123"})
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.body.text, 'success')
                done()
            })
        })
    });
});
