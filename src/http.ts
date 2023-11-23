import Taro from '@tarojs/taro';

export namespace http {
  let httpOptions: InitOptions;

  interface InitOptions {
    baseUrl?: string;
    showLoading?: boolean;
    showContent?: string;
    showLog?: boolean;
  }

  export const init = (initOptions: InitOptions) => {
    httpOptions.baseUrl = initOptions.baseUrl || '';
    httpOptions.showLoading = initOptions.showLoading || true;
    httpOptions.showContent = initOptions.showContent || '请求中';
    httpOptions.showLog = initOptions.showLog || true;
  };

  interface Options extends Taro.request.Option, InitOptions {}

  export const request = async (options: Options) => {
    options.showLoading = options.showLoading || httpOptions.showLoading;
    options.showContent = options.showContent || httpOptions.showContent;
    options.showLog = options.showLog || httpOptions.showLog;

    options.timeout = options.timeout || 10000;
    options.url = (options.baseUrl || httpOptions.baseUrl) + options.url;

    return new Promise((resolve, reject) => {
      if (options.showLoading) {
        Taro.showLoading({
          title: options.showContent || '请求中',
        });
      }

      options.success = (res) => {
        if (options.showLog) {
          console.log('ResponseSuccess: ', res);
        }

        if (options.success) {
          resolve(options.success(res));
        }

        if (res.statusCode === 200) {
          const data = res.data;
          if (data.code === 0) {
            // 成功
            resolve(data.data);
          } else {
            Taro.showModal({
              title: '错误',
              content: data.msg,
              showCancel: false,
            });
          }
        }
      };

      options.fail = (err) => {
        if (options.showLog) {
          console.log('ResponseFail: ', err);
        }

        if (options.fail) {
          reject(options.fail(err));
        }

        Taro.showToast({
          title: '请求失败',
          icon: 'error',
          duration: 2000,
        });
      };

      const originalComplete = options.complete;
      options.complete = (res: any) => {
        if (originalComplete) {
          originalComplete(res);
        }
        if (options.showLoading) {
          Taro.hideLoading();
        }
      };

      Taro.request(options);
    });
  };
}
