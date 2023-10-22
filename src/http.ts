import Taro from '@tarojs/taro';

export namespace http {
  let defaultHeaders: any = {};
  let baseUrlPrefix: string = '';

  type HeaderFunction = (...args: any[]) => {};

  const interceptor = function (chain: any) {
    const requestParams = chain.requestParams;
    console.log('RequestParams: ', requestParams);
    const { method, data, url } = requestParams;
    console.log(method, data, url);
    requestParams.header = {
      ...requestParams.header,
      ...defaultHeaders,
    };
    return chain.proceed(requestParams).then((res: any) => {
      return res;
    });
  };

  export const init = (
    prefixUrl: string,
    headers = {},
    fn: HeaderFunction = (...args: any[]) => {
      return {};
    },
    ...args: any[]
  ) => {
    baseUrlPrefix = prefixUrl;
    const extHeaders = fn(...args) || {};
    defaultHeaders = {
      ...headers,
      ...extHeaders,
    };
    Taro.addInterceptor(interceptor);
  };

  const request = async (method: any, url: string, params = {}, headers: any = {}) => {
    console.log('params: ', params);
    return new Promise((resolve, reject) => {
      Taro.showLoading({
        title: '请求中',
      });

      Taro.request({
        method: method,
        url: baseUrlPrefix + url,
        data: params,
        header: headers,
        timeout: 15000,
        success(res) {
          if (res.statusCode === 200) {
            const data = res.data;
            console.log('Response: ', data);
            if (data.code === 0) {
              // 成功
              resolve(data.data);
            } else {
              Taro.showToast({
                title: data.msg,
                icon: 'none',
              });
            }
          }
        },
        fail(e) {
          console.log('RequestError: ', e);
          Taro.showToast({
            title: '请求错误请重试',
            icon: 'none',
          });
          reject(e);
        },
        complete(e) {
          Taro.hideLoading();
        },
      });
    });
  };
}
