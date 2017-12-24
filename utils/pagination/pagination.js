Component({
    behaviors: [],
    properties: {
        curPage: { // 属性名
            type: Number, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: 1 // 属性初始值（可选），如果未指定则会根据类型选择一个
        },
        totalPage: { // 属性名
            type: Number, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: 0
        },
        totalItems: { // 属性名
            type: Number, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: 0
        }
    },
    data: {}, // 私有数据，可用于模版渲染

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { },
    moved: function () { },
    detached: function () { },

    methods: {
        prev() {
            this.triggerEvent('prev', 'prev')
        },
        next() {
            this.triggerEvent('next', 'next')
        },
        jumpToPage(e) {
            if (e.detail.value <= this.data.totalPage) {
                this.triggerEvent('jumptopage', e.detail)
            }
        }
    }

})