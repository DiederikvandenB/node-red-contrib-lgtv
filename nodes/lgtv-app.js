module.exports = function (RED) {
    function LgtvAppNode(n) {
        RED.nodes.createNode(this, n);
        const node = this;
        this.tv = n.tv;
        this.passthru = n.passthru;
        this.tvConn = RED.nodes.getNode(this.tv);

        if (this.tvConn) {
            this.tvConn.register(node);

            this.on('close', done => {
                node.tvConn.deregister(node, done);
            });

            if (node._wireCount) {
                node.tvConn.subscribe(node.id, 'ssap://com.webos.applicationManager/getForegroundAppInfo', (err, res) => {
                    if (!err && res) {
                        node.send({payload: (res.appId ?? '')});
                    }
                });
            }

            node.on('input', msg => {
                msg.payload = String(msg.payload);
                node.tvConn.request('ssap://system.launcher/launch', {id: msg.payload}, (err, res) => {
                    if (!err && !res.errorCode && node.passthru) {
                        node.send(msg);
                    }
                });
            });
        } else {
            this.error('No TV Configuration');
        }
    }

    RED.nodes.registerType('lgtv-app', LgtvAppNode);
};
