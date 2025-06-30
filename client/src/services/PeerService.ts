class PeerService {

    peer: RTCPeerConnection;
    constructor() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ]
                }
            ]
        })
    }

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await this.peer.setLocalDescription(
                new RTCSessionDescription(offer)
            );

            return offer;
        }
    }


    async getAnswer(offer: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(
                new RTCSessionDescription(offer)
            )

            const ans = await this.peer.createAnswer(offer);

            await this.peer.setLocalDescription(
                new RTCSessionDescription(ans)
            )

            return ans;
        }
    }

    async setLocalDescription(ans: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }


}

export default new PeerService();