
// window.RecorderIns 由 UnityComponent.vue 的 initRecord() 赋值

// 开始
function StartRecord() {
    if (!window.RecorderIns) return;
    window.RecorderIns.start();
}
// 结束
function StopRecord() {
    if (!window.RecorderIns) return;
    window.RecorderIns.stop(
        (blob, duration) => {
            console.log(
                blob,
                window.URL.createObjectURL(blob),
                "时长:" + duration + "ms"
            );
            sendWavData(blob)
        },
        (msg) => {
            console.log("录音失败:" + msg);
        }
    );
}
// 切片向Unity发送音频数据
function sendWavData(blob) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var _value = reader.result;
        var _partLength = 8192;
        var _length = parseInt(_value.length / _partLength);
        if (_length * _partLength < _value.length) _length += 1;
        var _head = "Head|" + _length.toString() + "|" + _value.length.toString() + "|end" ;
        // 使用 window.UnityIns（UnityComponent.vue 加载完成后赋值）
        if (!window.UnityIns) { console.warn('[recorder] UnityIns 未就绪'); return; }
        window.UnityIns.SendMessage("ChatManager", "GetAudioData", _head);
        for (var i = 0; i < _length; i++) {
            var _sendValue = "";
            if (i < _length - 1) {
                _sendValue = _value.substr(i * _partLength, _partLength);
            } else {
                _sendValue = _value.substr(
                    i * _partLength,
                    _value.length - i * _partLength
                );
            }
            _sendValue = "Part|" + i.toString() + "|" + _sendValue;
            window.UnityIns.SendMessage("ChatManager", "GetAudioData", _sendValue);
        }
        _value = null;
    };
    reader.readAsDataURL(blob);
}
