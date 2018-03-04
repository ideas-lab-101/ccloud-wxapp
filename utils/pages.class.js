class Pages {
    constructor() {
        this.$$cache = {};
    }

    /**
     * 新增Page实例
     * 
     * @param {any} pageModel Page实例
     * @memberof pages
     */
    add(pageModel) {
        const pagePath = this._getPageModelPath(pageModel);
        this.$$cache[pagePath] = pageModel;
    }

    /**
     * 获取Page实例
     * 
     * @param {any} pagePath Page路径
     * @returns Page实例
     * @memberof pages
     */
    get(pagePath) {
        return this.$$cache[pagePath];
    }

    /**
     * 删除Page实例
     * 
     * @param {any} pageModel Page实例
     * @memberof pages
     */
    delete(pageModel) {
        try {
            delete this.$$cache[this._getPageModelPath(pageModel)];
        } catch (e) {
        }
    }

    /**
     * 获取Page实例路径
     * 
     * @param {any} pageModel Page实例
     * @returns Page实例路径
     * @memberof pages
     */
    _getPageModelPath(page) {
        return page.__route__;
    }
}
module.exports = Pages;