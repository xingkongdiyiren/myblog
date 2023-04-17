# 1、介绍

1、服务发现与健康监测

2、动态配置服务

3、动态DNS服务

4、服务及其元数据管理

# 2、使用场景

![1664475618062.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665166751545-4b82c15d-6bc1-479c-afa9-77970fa23e63.png#averageHue=%23d4bd3a&clientId=u10bed075-3755-4&errorMessage=unknown%20error&from=drop&id=u75b5ec8d&name=1664475618062.png&originHeight=402&originWidth=851&originalType=binary&ratio=1&rotation=0&showTitle=false&size=92834&status=error&style=none&taskId=u613f1564-5537-4fd1-8622-ee4e1b50206&title=)

## 2.1、动态配置服务

动态配置服务让您能够以中心化、外部化和动态化的方式管理所有环境的配置。动态配置消除了配置变更时重新部署应用和服务的需要。配置中心化管理让实现无状态服务更简单，也让按需弹性扩展服务更容易。

## 2.2、服务发现及管理

动态服务发现对以服务为中心的（例如微服务和云原生）应用架构方式非常关键。Nacos支持DNS-Based和RPC-Based（Dubbo、gRPC）模式的服务发现。Nacos也提供实时健康检查，以防止将请求发往不健康的主机或服务实例。借助Nacos，您可以更容易地为您的服务实现断路器。

### 2.2.1、服务注册

Nacos Client会通过发送REST请求的方式向Nacos Server注册自己的服务，提供自身的元数据，比如ip地 址、端口等信息。Nacos Server接收到注册请求后，就会把这些元数据信息存储在一个双层的内存Map中。

### 2.2.2、服务心跳

在服务注册后，Nacos Client会维护一个定时心跳来持续通知Nacos Server，说明服务一直处于可用状态，防 止被剔除。默认5s发送一次心跳。

### 2.2.3、服务同步

Nacos Server集群之间会互相同步服务实例，用来保证服务信息的一致性。 leader raft

### 2.2.4、服务发现

服务消费者(Nacos Client)在调用服务提供者的服务时，会发送一个REST请求给Nacos Server，获取上面 注册的服务清单，并且缓存在Nacos Client本地，同时会在Nacos Client本地开启一个定时任务定时拉取服务端最新的注 册表信息更新到本地缓存

### 2.2.5、服务健康检查

Nacos Server会开启一个定时任务用来检查注册服务实例的健康情况，对于超过15s没有收到客户端心跳 的实例会将它的healthy属性置为false(客户端服务发现时不会发现)，如果某个实例超过30秒没有收到心跳，直接剔除该 实例(被剔除的实例如果恢复发送心跳则会重新注册)

# 3、环境搭建

## 3.1、版本选择

## ![1664475689700.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665166758764-9c0e58db-d8b1-4635-ace2-f76ec48b523c.png#averageHue=%23373b42&clientId=u10bed075-3755-4&errorMessage=unknown%20error&from=drop&id=ksOmX&name=1664475689700.png&originHeight=305&originWidth=731&originalType=binary&ratio=1&rotation=0&showTitle=false&size=139686&status=error&style=none&taskId=uee555ff0-58ca-41c4-a116-1b088cc9808&title=)

![1664475724379.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665166767563-efcf592d-b40e-4e7d-9a78-9418f1673763.png#averageHue=%2336393e&clientId=u10bed075-3755-4&errorMessage=unknown%20error&from=drop&id=AMOLl&name=1664475724379.png&originHeight=295&originWidth=1515&originalType=binary&ratio=1&rotation=0&showTitle=false&size=121349&status=error&style=none&taskId=ue2144295-366d-4d68-a900-f7124859a9c&title=)

## 3.2、下载文件

### 3.2.1、文件下载方式(windows)

注意：Linux环境也是一样的配置，只不过是启动文件不一样而已。
第一步：下载文件
[https://github.com/alibaba/nacos/releases/tag/1.4.1](https://github.com/alibaba/nacos/releases/tag/1.4.1)
也可以用我的百度云网盘

> 链接：[https://pan.baidu.com/s/1w32BekIOSzILJbDgW4pO0w?pwd=n39q](https://pan.baidu.com/s/1w32BekIOSzILJbDgW4pO0w?pwd=n39q)
> 提取码：n39q

第二步：配置**nacos\conf\application.properties**，添加

```properties
### If use MySQL as datasource:
spring.datasource.platform=mysql

### Count of DB:
db.num=1

### Connect URL of DB:
db.url.0=jdbc:mysql://localhost:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user.0=root
db.password.0=root
```

![1664477361478.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665166834083-8a6de435-3831-4754-978b-7064eb73b76a.png#averageHue=%23fafaf8&clientId=u10bed075-3755-4&errorMessage=unknown%20error&from=drop&id=u2d398ba6&name=1664477361478.png&originHeight=815&originWidth=836&originalType=binary&ratio=1&rotation=0&showTitle=false&size=73449&status=error&style=none&taskId=ued5900ca-afad-4273-969c-209d6af8c7c&title=)
第三步：把**nacos\conf\cluster.conf.example**改成**nacos\conf\cluster.conf**，也就是去掉后缀**.example**
![1664477465150.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665166849806-0eedab57-0dd2-4a97-8fe3-bd64ef101633.png#averageHue=%23f9f7f5&clientId=u10bed075-3755-4&errorMessage=unknown%20error&from=drop&id=u9bd3c9e5&name=1664477465150.png&originHeight=299&originWidth=402&originalType=binary&ratio=1&rotation=0&showTitle=false&size=18486&status=error&style=none&taskId=uc7a23669-e6de-4738-b3a0-aa7a1c3f6a4&title=)
启动

### 3.2.2、docker一键部署方式

> _#安装_
> docker run --name nacos -e MODE=standalone -p 8848:8848 -d nacos/nacos-server:1.4.1
> _#访问地址：_
> http://公网地址（阿里云上或者本地的虚拟机ip）:8848/nacos/

## 3.3、源码编译，本地启动

### 3.3.1、源码下载

[https://github.com/alibaba/nacos/tree/1.4.0-BETA](https://github.com/alibaba/nacos/tree/1.4.0-BETA)

### 3.3.2、开始编译，通过IDEA导入，会自动编译

### 3.3.3、导入sql

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666889549732-b640cf0a-802e-4fd7-8f1b-9d4b0280e729.png#averageHue=%232b3039&clientId=u8312bad0-7ae6-4&from=paste&height=482&id=ue28a27b9&name=image.png&originHeight=603&originWidth=561&originalType=binary&ratio=1&rotation=0&showTitle=false&size=53946&status=done&style=none&taskId=ucc11060b-8fa3-43bc-bb70-56f42e1c1db&title=&width=448.8)

### 3.3.4、修改配置文件

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666889631520-a79f359b-ab2e-4a9c-9f80-57ec1fed5524.png#averageHue=%232a2f38&clientId=u8312bad0-7ae6-4&from=paste&height=302&id=u947fdc91&name=image.png&originHeight=377&originWidth=380&originalType=binary&ratio=1&rotation=0&showTitle=false&size=16453&status=done&style=none&taskId=ub77b2cdc-c839-4fce-9046-fc53b66f6bc&title=&width=304)
添加配置：

```properties
db.num=1

### Connect URL of DB:
db.url.0=jdbc:mysql://localhost:3307/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user.0=root
db.password.0=root
```

### 3.3.5、启动

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666890473253-af0829bf-1d7c-49dd-95b3-d82e9cada78b.png#averageHue=%23292e38&clientId=u8312bad0-7ae6-4&from=paste&height=653&id=u08c55ea0&name=image.png&originHeight=816&originWidth=680&originalType=binary&ratio=1&rotation=0&showTitle=false&size=69632&status=done&style=none&taskId=u73c6ca6d-19c8-4aa1-bb87-cc5717d8c27&title=&width=544)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666889724315-06c071f6-7228-4b4e-a991-b80e4152506d.png#averageHue=%232a2e37&clientId=u8312bad0-7ae6-4&from=paste&height=719&id=ua27b0949&name=image.png&originHeight=899&originWidth=1322&originalType=binary&ratio=1&rotation=0&showTitle=false&size=88216&status=done&style=none&taskId=u71f8a387-0eef-4774-9c6b-8b0b43b968b&title=&width=1057.6)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666889699485-cda3970d-cef9-4d2a-ab1d-dfb15772a45b.png#averageHue=%232a2f38&clientId=u8312bad0-7ae6-4&from=paste&height=323&id=u5c0236b4&name=image.png&originHeight=404&originWidth=521&originalType=binary&ratio=1&rotation=0&showTitle=false&size=28940&status=done&style=none&taskId=u7334d762-611f-4bfd-a50b-3f5659cf1cc&title=&width=416.8)

### 3.3.6、运行结果

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666890718424-b71d43e7-deac-438e-a780-4d72db89555f.png#averageHue=%23a09771&clientId=u8312bad0-7ae6-4&from=paste&height=560&id=u61abd6c6&name=image.png&originHeight=700&originWidth=1753&originalType=binary&ratio=1&rotation=0&showTitle=false&size=318799&status=done&style=none&taskId=uff6c6873-cdfa-48b2-8fbb-0d99ce51949&title=&width=1402.4)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666891006188-2b55af0a-049a-4e0f-bfdd-85b7452bb73a.png#averageHue=%23e3cea2&clientId=u8312bad0-7ae6-4&from=paste&height=489&id=u584d66e9&name=image.png&originHeight=611&originWidth=1700&originalType=binary&ratio=1&rotation=0&showTitle=false&size=57003&status=done&style=none&taskId=uee54454d-bb2d-4ba8-a391-07ff1866cd2&title=&width=1360)

## 3.4、Nacos集群部署

### 3.4.1、部署图：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668358434095-14e2ff32-1b11-4e87-84f3-c4c7e8deb33f.png#averageHue=%23fdfbfb&clientId=u9a57120e-e2d2-4&from=paste&height=538&id=ucb9d1102&name=image.png&originHeight=538&originWidth=1234&originalType=binary&ratio=1&rotation=0&showTitle=false&size=220477&status=done&style=none&taskId=u0730042a-e4d5-4ebf-809d-a95099a58d6&title=&width=1234)

### 3.4.2、集群启动

在本地通过3个端口模拟3台机器，端口分别是：8848，8858，
8868。

> #copy3份解压后的nacos，修改各自的
> application.properties中的端口号，分别为：8848，
> 8858，8868
> server.port=8848
> server.port=8858
> server.port=8868


各自的conf目录下放cluster.conf文件，文件内容为：

> 192.168.66.100:8848
> 192.168.66.100:8858
> 192.168.66.100:8868


启动三个nacos

>  ./startup.sh


### 3.4.3、注意：

> 如果内存不够可以修改内存参数。
> Xms 是指设定程序启动时占用内存大小
> Xmx 是指设定程序运行期间最大可占用的内存大小
> Xmn 新生代的大小

### 3.4.4、使用Nginx作负载均衡访问集群的Nacos

#### 3.4.4.1、环境安装

> yum -y install gcc make automake pcre-devel  zlib zlib-devel openssl openssl-devel

#### 3.4.4.2、安装Nginx

> ./configure
> make && make install

#### 3.4.4.3、配置nginx.conf文件

```shell
#定义upstream名字，下面会引用
upstream nacos{  
        #指定后端服务器地址
        server 192.168.66.100:8848;        
        server 192.168.66.100:8858;  
        server 192.168.66.100:8868;    
}
server {
  listen 80;
  server_name localhost;
  location / {
  	  #引用upstream
      proxy_pass http://nacos;
 }
}
```

#### 3.4.4.4、重启Nginx

> docker restart nginx

### 3.4.5、负载均衡Nacos

> 请求：[http://192.168.66.100/nacos](http://192.168.66.100/nacos)

# 4、配置中心介绍与对比

## 4.1、配置中心介绍

### 4.1.1、没有配置中心的情况下配置文件管理![1664903287109.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665166888863-e10c855b-c1f3-42ef-859b-634f8746c577.png#averageHue=%23dccfb0&clientId=u10bed075-3755-4&errorMessage=unknown%20error&from=drop&id=u9dcd916b&name=1664903287109.png&originHeight=337&originWidth=866&originalType=binary&ratio=1&rotation=0&showTitle=false&size=93635&status=error&style=none&taskId=ue0a42821-9b48-43b3-bdf8-837067a9d31&title=)

问题：

- 配置文件数量会随着服务的增加而增加
- 单个配置文件无法区分多个运行环境
- 配置文件内容无法动态更新，需要重启服务

### 4.1.2、有配置中心的情况下配置文件管理![1664903471669.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665166895832-5fc3b479-a076-4f2c-98cf-a6f63128f9ee.png#averageHue=%23c7ddb1&clientId=u10bed075-3755-4&errorMessage=unknown%20error&from=drop&id=u3f379bdb&name=1664903471669.png&originHeight=444&originWidth=487&originalType=binary&ratio=1&rotation=0&showTitle=false&size=75101&status=error&style=none&taskId=ue0b4e18b-516a-4f7b-9078-7d964e69b36&title=)

解决了什么问题？

- 统一配置文件管理
- 提供统一标准接口，服务根据标准接口自行拉取配置
- 支持动态更新的到所有服务

## 4.2、配置中心对比

![1665165402408.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665166913574-a03ae7ba-1691-4cd8-a5c6-a0f2f06545c7.png#averageHue=%23f8f8f7&clientId=u10bed075-3755-4&errorMessage=unknown%20error&from=drop&id=ucd8956e3&name=1665165402408.png&originHeight=642&originWidth=1076&originalType=binary&ratio=1&rotation=0&showTitle=false&size=169098&status=error&style=none&taskId=u00c1c168-c0a7-4f35-a47b-6ba771e778f&title=)

### 4.2.1、Apollo

官网：[https://www.apolloconfig.com/#/zh/README](https://www.apolloconfig.com/#/zh/README)
内容有安装，架构，设计等

#### 4.2.1.1、简介

- Apollo（阿波罗）是一款可靠的分布式配置管理中心，诞生于携程框架研发部，能够**集中化管理应用不同环境、不同集群的配置，配置修改后能够实时推送到应用端，并且具备规范的权限、流程治理**等特性，适用于微服务配置管理场景。
- 服务端基于Spring Boot和Spring Cloud开发，打包后可以直接运行，不需要额外安装Tomcat等应用容器。
- Java客户端不依赖任何框架，能够运行于所有Java运行时环境，同时对Spring/Spring Boot环境也有较好的支持。
- .Net客户端不依赖任何框架，能够运行于所有.Net运行时环境。

#### 4.2.1.2、特性

- **统一管理不同环境、不同集群的配置**
  - Apollo提供了一个统一界面集中式管理不同环境（environment）、不同集群（cluster）、不同命名空间（namespace）的配置。
  - 同一份代码部署在不同的集群，可以有不同的配置，比如zk的地址等
  - 通过命名空间（namespace）可以很方便的支持多个不同应用共享同一份配置，同时还允许应用对共享的配置进行覆盖
  - 配置界面支持多语言（中文，English）
- **配置修改实时生效（热发布）**
  - 用户在Apollo修改完配置并发布后，客户端能实时（1秒）接收到最新的配置，并通知到应用程序。
- **版本发布管理**
  - 所有的配置发布都有版本概念，从而可以方便的支持配置的回滚。
- **灰度发布**
  - 支持配置的灰度发布，比如点了发布后，只对部分应用实例生效，等观察一段时间没问题后再推给所有应用实例。
- **权限管理、发布审核、操作审计**
  - 应用和配置的管理都有完善的权限管理机制，对配置的管理还分为了编辑和发布两个环节，从而减少人为的错误。
  - 所有的操作都有审计日志，可以方便的追踪问题。
- **客户端配置信息监控**
  - 可以方便的看到配置在被哪些实例使用
- **提供Java和.Net原生客户端**
  - 提供了Java和.Net的原生客户端，方便应用集成
  - 支持Spring Placeholder，Annotation和Spring Boot的ConfigurationProperties，方便应用使用（需要Spring 3.1.1+）
  - 同时提供了Http接口，非Java和.Net应用也可以方便的使用
- **提供开放平台API**
  - Apollo自身提供了比较完善的统一配置管理界面，支持多环境、多数据中心配置管理、权限、流程治理等特性。
  - 不过Apollo出于通用性考虑，对配置的修改不会做过多限制，只要符合基本的格式就能够保存。
  - 在我们的调研中发现，对于有些使用方，它们的配置可能会有比较复杂的格式，如xml, json，需要对格式做校验。
  - 还有一些使用方如DAL，不仅有特定的格式，而且对输入的值也需要进行校验后方可保存，如检查数据库、用户名和密码是否匹配。
  - 对于这类应用，Apollo支持应用方通过开放接口在Apollo进行配置的修改和发布，并且具备完善的授权和权限控制
- **部署简单**
  - 配置中心作为基础服务，可用性要求非常高，这就要求Apollo对外部依赖尽可能地少
  - 目前唯一的外部依赖是MySQL，所以部署非常简单，只要安装好Java和MySQL就可以让Apollo跑起来
  - Apollo还提供了打包脚本，一键就可以生成所有需要的安装包，并且支持自定义运行时参数

#### 4.2.1.3、别人总结的（主要是懒，我很少用这个，都是用的nacos）

[https://blog.csdn.net/Dbh321/article/details/125533024](https://blog.csdn.net/Dbh321/article/details/125533024)

### 4.2.2、nacos

略，本篇文章重点讲

### 4.2.3、SpringCloud Config

引用：[https://blog.csdn.net/weixin_38192427/article/details/121198238](https://blog.csdn.net/weixin_38192427/article/details/121198238)

### 4.2.4、Disconfig

引用：[https://blog.csdn.net/fy_java1995/article/details/109237027](https://blog.csdn.net/fy_java1995/article/details/109237027)

# 5、Nacos集成SpringBoot实现统一配置管理

## 5.1、简单版（单配置文件版）

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665167043488-a3911fa5-03ef-4cc1-bd65-2bc906c11fc1.png#averageHue=%232c3139&clientId=u92d3ba0e-bdee-4&errorMessage=unknown%20error&from=paste&height=434&id=u30582b22&name=image.png&originHeight=543&originWidth=473&originalType=binary&ratio=1&rotation=0&showTitle=false&size=39686&status=error&style=none&taskId=u30cd664b-6601-4db8-b47c-db8b3606540&title=&width=378.4)

### 5.1.1、pom依赖

```xml
<dependency>
  <groupId>com.alibaba.cloud</groupId>
  <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

### 5.1.2、bootstrap.yml配置

```yaml
spring:
  application:
    name: nacos-config-demo # 表示当前微服务需要向配置中心索要nacos-config-demo的文件
  cloud:
    nacos:
      config:
        server-addr: http://1localhost:8848 # 表示去哪里找，nacos配置中心地址
        file-extension: yml # 表示支持的扩展文件名
```

### 5.1.3、Nacos中的配置

访问地址：http://localhost:8848/nacos，新建
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665167229210-b58ab624-2e66-4c39-bb99-c0b6170d8f1b.png#averageHue=%23979797&clientId=u92d3ba0e-bdee-4&errorMessage=unknown%20error&from=paste&height=532&id=uf76ff2a6&name=image.png&originHeight=665&originWidth=872&originalType=binary&ratio=1&rotation=0&showTitle=false&size=28005&status=error&style=none&taskId=u4a543f13-ee6e-4943-ab6d-6a361a60002&title=&width=697.6)

### 5.1.4、测试代码

```java
package com.zshy.nacos.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author zhouhengzhe
 * @description: 控制器
 * @date 2022/10/5 1:24
 * @since v1
 */
@RestController
@RefreshScope
public class TestController {

    @Value("${testStr}")
    private String testStr;

    @GetMapping("/test")
    public String test(){
        return testStr;
    }
}
```

### 5.1.5、启动类

```java
package com.zshy.nacos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author zhouhengzhe
 * @description: nacos config 启动类
 * @date 2022/10/5 1:23
 * @since v1
 */
@SpringBootApplication
public class NacosConfigApplication {
    public static void main(String[] args) {
        SpringApplication.run(NacosConfigApplication.class, args);
    }
}
```

### 5.1.6、运行结果![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665167402242-f9aecb17-44ac-444f-8ea5-6ca3d7ff8abd.png#averageHue=%23f1e4b0&clientId=u92d3ba0e-bdee-4&errorMessage=unknown%20error&from=paste&height=162&id=uccbdb7d5&name=image.png&originHeight=203&originWidth=950&originalType=binary&ratio=1&rotation=0&showTitle=false&size=29927&status=error&style=none&taskId=u23da30ce-0888-4b76-aba5-ea7733ac654&title=&width=760)

### 5.1.7、详细代码（源码）

[https://gitee.com/zhouzhz/java-system-learn/tree/master/Spring%E4%B9%8BDemo%E7%B3%BB%E5%88%97/SpringCloud-2022/nacos-config-demo](https://gitee.com/zhouzhz/java-system-learn/tree/master/Spring%E4%B9%8BDemo%E7%B3%BB%E5%88%97/SpringCloud-2022/nacos-config-demo)

## 5.2、复杂版（多环境切换）

多环境切换指的是：开发环境，测试环境，预发环境，线上环境。

### 5.2.1、nacos-config-demo-dev.yml

Nacos中的SpringBoot配置文件的**优先级**：
**bootstrap.properties>bootstrap.yaml>application.properties>application.yml**
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665167745234-03f864d6-afa5-4a43-b506-1e77008de69e.png#averageHue=%23f0e1ad&clientId=u92d3ba0e-bdee-4&errorMessage=unknown%20error&from=paste&height=334&id=u1ff0ac09&name=image.png&originHeight=418&originWidth=761&originalType=binary&ratio=1&rotation=0&showTitle=false&size=106592&status=error&style=none&taskId=udb3e0b5f-67a1-45d0-8cc0-ac361806e9c&title=&width=608.8)
在Nacos config配置管理中新增配置如图极其对应关系如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665336443951-abc51f8b-7383-4ec2-9257-b360d1454840.png#averageHue=%2374706f&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=400&id=u6f8ae6dc&name=image.png&originHeight=500&originWidth=1671&originalType=binary&ratio=1&rotation=0&showTitle=false&size=123449&status=error&style=none&taskId=ufd66c0d2-e4e6-43ed-a1fb-910a31f05f6&title=&width=1336.8)
索要文件的格式为：${spring.application.name}-${spring.profiles.active}.${spring.cloud.nacos.config.file-extension}
所以我们可以得知再nacos中的文件名就是**nacos-config-demo-dev.yml**
配置内容为：

```yaml
testConfig: 开发配置
```

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665333082728-a8418d43-4ea1-44d5-8871-d71c1d27b62e.png#averageHue=%23e4bc8c&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=529&id=ud8647be5&name=image.png&originHeight=661&originWidth=930&originalType=binary&ratio=1&rotation=0&showTitle=false&size=31230&status=error&style=none&taskId=ufe9e9c2a-7a42-40fb-953b-c7643be2a05&title=&width=744)

### 5.2.2、bootstrap.yml

本地项目bootstrap.yml配置为：

```yaml
spring:
  application:
    name: nacos-config-demo # 表示当前微服务需要向配置中心索要nacos-config-demo的文件
  cloud:
    nacos:
      config:
        server-addr: http://106.52.205.232:8848 # 表示去哪里找，nacos配置中心地址
        file-extension: yml # 表示支持的扩展文件名
  profiles:
    active: dev # 表示我需要向配置中心索要的开发环境的配置
```

### 5.2.3、controller

controller配置：

```java
package com.zshy.nacos.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author zhouhengzhe
 * @description: 控制器
 * @date 2022/10/5 1:24
 * @since v1
 */
@RestController
@RefreshScope
public class TestController {

    @Value("${testConfig}")
    private String testConfig;

    @GetMapping("/test")
    public String test(){
        return testConfig;
    }
}

```

### 5.2.4、运行结果

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665333187733-eb4122aa-41c7-4ef4-b78a-8f4e0512da1e.png#averageHue=%23fdfdfc&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=272&id=u6ab4b7b4&name=image.png&originHeight=340&originWidth=688&originalType=binary&ratio=1&rotation=0&showTitle=false&size=23453&status=error&style=none&taskId=udec04412-d601-4286-883c-4ef1386baf8&title=&width=550.4)

### 5.2.5、动态配置验证

动态配置验证，修改nacos文件中的配置为：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665333320886-6db03dd2-41bf-4c0b-8816-427dfa34b29b.png#averageHue=%23c7c7c7&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=410&id=ufb6fb1c6&name=image.png&originHeight=512&originWidth=521&originalType=binary&ratio=1&rotation=0&showTitle=false&size=20745&status=error&style=none&taskId=uca7032e2-9560-498a-bcb5-5df41156d53&title=&width=416.8)

### 5.2.6、动态配置验证后的运行结果

运行结果就会变成
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665333338583-009fda32-8550-4218-b9b7-2b3ae591bf29.png#averageHue=%23fcfcfa&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=153&id=u1803ea8c&name=image.png&originHeight=191&originWidth=454&originalType=binary&ratio=1&rotation=0&showTitle=false&size=11523&status=error&style=none&taskId=u93a74254-b19e-4620-9ab2-5296508a6da&title=&width=363.2)

### 5.2.7、多环镜演示

假设我们的项目中的Nacos配置有n多个，如下
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665333793247-88515b93-8ebe-4e7c-899a-8741f40d4524.png#averageHue=%23eccd9a&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=190&id=ua03e4720&name=image.png&originHeight=237&originWidth=878&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25558&status=error&style=none&taskId=u3b71ea37-9228-42b0-8082-bb063fa9859&title=&width=702.4)
那么我们项目中，该怎么指定的，大家想一想，我们平常中是有n多个机器的，那么我们怎么指定运行哪个配置文件呢

```java
# dev/test/uat/prod四选一
java -jar xxx.jar -Dspring.profiles.active=dev/test/uat/prod
```

### 5.2.8、解决多环境共同配置(个人觉得很少用)

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665334678846-c2bd5c10-359a-4417-b5e7-7bef8db88eec.png#averageHue=%235a6459&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=219&id=u9e3774ac&name=image.png&originHeight=274&originWidth=775&originalType=binary&ratio=1&rotation=0&showTitle=false&size=86320&status=error&style=none&taskId=ue4b2168b-f373-4ffe-a143-d90757dc723&title=&width=620)
新建文件**nacos-config-demo.yml**
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665334896352-98c2ad51-4faf-4d91-9134-80064c4ac71a.png#averageHue=%23a4a4a4&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=534&id=u907f2bbe&name=image.png&originHeight=668&originWidth=833&originalType=binary&ratio=1&rotation=0&showTitle=false&size=26911&status=error&style=none&taskId=ua18fccbf-1a81-4843-a547-42cbac2a04e&title=&width=666.4)
controller代码：

```java
package com.zshy.nacos.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author zhouhengzhe
 * @description: 控制器
 * @date 2022/10/5 1:24
 * @since v1
 */
@RestController
@RefreshScope
public class TestController {

    @Value("${testConfig}")
    private String testConfig;

    @Value("${testCommon}")
    private String testCommon;

    @GetMapping("/test")
    public String test(){
        return testConfig + "/t"+ testCommon;
    }
}

```

运行结果
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665334932407-d50abd86-92ea-4321-b8fd-b67e184716e3.png#averageHue=%23e5c289&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=134&id=ude25d121&name=image.png&originHeight=168&originWidth=361&originalType=binary&ratio=1&rotation=0&showTitle=false&size=12643&status=error&style=none&taskId=udadc4694-07aa-446c-9507-d79462f59af&title=&width=288.8)
如果同一个配置项再三个配置文件中都存在且值不同，最终项目读取的是什么？
如果配置了spring.profiles.active则优先获取**nacos-config-demo-${spring.profiles.active}.yml**的值
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665335189568-c5421fac-073d-4e06-b645-dfae21727e85.png#averageHue=%23daf3bd&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=406&id=uee6204d0&name=image.png&originHeight=507&originWidth=918&originalType=binary&ratio=1&rotation=0&showTitle=false&size=153915&status=error&style=none&taskId=u60989465-7510-4c61-bd75-6185e9f641a&title=&width=734.4)

### 5.2.9、不同微服务之间相同配置如何共享

比如一些redis地址，MQ地址，服务注册中心等公共配置都是多个微服务共享的，并不属于某个微服务。配置如下
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665335387797-5f6d7231-aa9a-4337-8e9f-816c76051c31.png#averageHue=%23f2e1ad&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=641&id=ub97f690a&name=image.png&originHeight=801&originWidth=1512&originalType=binary&ratio=1&rotation=0&showTitle=false&size=417191&status=error&style=none&taskId=u675502a4-cf5f-4bce-a24d-12bfa8a300d&title=&width=1209.6)
Nacos Config为我们提供了两种解决方案：

#### shared-configs

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665336109519-651552bd-a143-4ca9-b62f-74155c56b733.png#averageHue=%23adadad&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=523&id=u53d87800&name=image.png&originHeight=654&originWidth=904&originalType=binary&ratio=1&rotation=0&showTitle=false&size=28350&status=error&style=none&taskId=u78e2f0de-e3d7-428a-97bc-3c03f3a12a0&title=&width=723.2)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665336145579-4e6e4158-01d9-417c-a088-edf8bb817a77.png#averageHue=%23bcbcbc&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=464&id=u7ef5f653&name=image.png&originHeight=580&originWidth=551&originalType=binary&ratio=1&rotation=0&showTitle=false&size=21162&status=error&style=none&taskId=u1db3c72a-5e2d-4339-bfdb-410f8691c09&title=&width=440.8)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665336158625-a46264c2-3293-49dd-af49-813eb5e1b0bc.png#averageHue=%23cccbcb&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=444&id=u91a3b69e&name=image.png&originHeight=555&originWidth=557&originalType=binary&ratio=1&rotation=0&showTitle=false&size=21230&status=error&style=none&taskId=ue45d6244-84a3-4f13-b3ec-c2057774c44&title=&width=445.6)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665336176085-26da7172-5b12-4176-bc77-e21b513c4560.png#averageHue=%23e5bb8a&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=503&id=ub2a512c5&name=image.png&originHeight=629&originWidth=579&originalType=binary&ratio=1&rotation=0&showTitle=false&size=23542&status=error&style=none&taskId=u5068e837-35b3-4499-a150-a45c7e1e3d4&title=&width=463.2)
bootstrap.yml

```yaml
spring:
  application:
    name: nacos-config-demo # 表示当前微服务需要向配置中心索要nacos-config-demo的文件
  cloud:
    nacos:
      config:
        server-addr: http://localhost:8848 # 表示去哪里找，nacos配置中心地址
        file-extension: yml # 表示支持的扩展文件名
        shared-configs[0]:
          data_id: rocketmq-config.yml
          refresh: true
        shared-configs[1]:
          data_id: redis-config.yml
          refresh: true
  profiles:
    active: prod # 表示我需要向配置中心索要的开发环境的配置
```

controller配置

```java
package com.zshy.nacos.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
* @author zhouhengzhe
* @description: 控制器
* @date 2022/10/5 1:24
* @since v1
*/
@RestController
    @RefreshScope
    public class TestController {

        @Value("${testConfig}")
        private String testConfig;

        @Value("${testCommon}")
        private String testCommon;

        @Value("${redisip}")
        private String redisip;

        @Value("${rocketmqip}")
        private String rocketmqip;

        @GetMapping("/test")
        public String test() {
            return String.format("当前配置为%s,\t 基础配置文件为%s,\tredis配置文件：%s ,\t rocketmq配置文件为:%s",
                                 testConfig, testCommon, redisip, rocketmqip);
        }
    }

```

运行效果：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665336220258-d3a1c928-6c57-4b17-a2ac-54629d6e4a83.png#averageHue=%23e6c184&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=151&id=u24d9f96f&name=image.png&originHeight=189&originWidth=1141&originalType=binary&ratio=1&rotation=0&showTitle=false&size=36093&status=error&style=none&taskId=u8ec95c11-95ad-4c35-8c4d-ea27e9eadee&title=&width=912.8)
**注意：当通用配置文件中出现相同的值时，下面的会覆盖上面的。**

#### extension-configs

bootstrap.yml配置更新成

```yaml
spring:
  application:
    name: nacos-config-demo # 表示当前微服务需要向配置中心索要nacos-config-demo的文件
  cloud:
    nacos:
      config:
        server-addr: http://106.52.205.232:8848 # 表示去哪里找，nacos配置中心地址
        file-extension: yml # 表示支持的扩展文件名
#        shared-configs[0]:
#          data_id: rocketmq-config.yml
#          refresh: true
#        shared-configs[1]:
#          data_id: redis-config.yml
#          refresh: true
        extension-configs[0]:
          data_id: rocketmq-config.yml
          refresh: true
        extension-configs[1]:
            data_id: redis-config.yml
            refresh: true
  profiles:
    active: prod # 表示我需要向配置中心索要的开发环境的配置
```

其余不变。

### 总结

demo.yml demo-dev.yml shard-configs extension-config读取顺序
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665336872894-ff8b9363-e85a-42aa-8360-c3eff30a555d.png#averageHue=%2332302f&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=216&id=u72f12ff3&name=image.png&originHeight=270&originWidth=907&originalType=binary&ratio=1&rotation=0&showTitle=false&size=60120&status=error&style=none&taskId=uceb2d6d1-866d-4cfa-b7c9-212d6bf0bf6&title=&width=725.6)
由上面打印的日志可知

## 5.3、补充：Nacos概念

### 5.3.1、Namespace命名空间（多环境的管理与隔离）

现如今，在微服务体系中，一个系统往往被拆分为多个服务，每个服务都有自己的配置文件，然后每个系统往往还会准备开发环境、测试环境、正式环境。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668358722683-3458fd31-2c58-491d-84c6-4d29d55d0a10.png#averageHue=%23f4cab2&clientId=u9a57120e-e2d2-4&from=paste&height=346&id=u50669ae3&name=image.png&originHeight=346&originWidth=1046&originalType=binary&ratio=1&rotation=0&showTitle=false&size=80400&status=done&style=none&taskId=u993162cf-f7d2-4544-93d2-867455b1367&title=&width=1046)
问题：我们来说算一算，假设某系统有10个微服务，那么至少有10个配置文件吧，三个环境（dev\test\prod），那就有30个配置文件需要进行管理。

> Namespace可以帮助我们进行多环境下的管理与隔离

#### 5.3.2.2、概念

用于进行租户粒度的配置隔离。不同的命名空间下，可以存在相同的 Group 或 Data ID 的配置。Namespace 的常用场景之一是不同环境的配置的区分隔离，例如开发测试环境和生产环境的资源（如配置、服务）隔离等。默认namespace=public的保留空间,不支持删除;默认情况下。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668358831747-91c88cac-fe47-4f5c-99c6-7d0cc2d42fc5.png#averageHue=%23efd9c5&clientId=u9a57120e-e2d2-4&from=paste&height=304&id=u8915d128&name=image.png&originHeight=304&originWidth=966&originalType=binary&ratio=1&rotation=0&showTitle=false&size=87745&status=done&style=none&taskId=ub32ed124-c9b0-4d7e-8a7b-5a908bfef8a&title=&width=966)

#### 5.3.2.3、场景

Nacos给的最佳实践表明，最外层的namespace是可以用于区分部署环境的，比如test，dev，prod等。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668358874607-4883cdf5-3b3b-44b2-81be-3ee06fdf64d0.png#averageHue=%23ededed&clientId=u9a57120e-e2d2-4&from=paste&height=500&id=u2dc37a39&name=image.png&originHeight=500&originWidth=1076&originalType=binary&ratio=1&rotation=0&showTitle=false&size=105012&status=done&style=none&taskId=ua29353b2-ad70-4998-aff7-bd616aee5c4&title=&width=1076)
注意：命名空间可用于进行不同环境的配置隔离。一般一个环境划分到一个命名空间。

#### 5.3.2.4、如何新建Namespace

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668358974803-382fde40-cf5f-4f27-829f-413e6363e706.png#averageHue=%23fa3b2f&clientId=u9a57120e-e2d2-4&from=paste&height=596&id=ue71f00b0&name=image.png&originHeight=596&originWidth=1079&originalType=binary&ratio=1&rotation=0&showTitle=false&size=59283&status=done&style=none&taskId=u70a17c2e-960e-421d-973f-2a5e2ff094c&title=&width=1079)

#### 5.3.2.5、如何查看Namespace

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359029763-42b43589-cd76-4e51-a373-5ba0f27fb716.png#averageHue=%23f2f2f3&clientId=u9a57120e-e2d2-4&from=paste&height=343&id=udecd723e&name=image.png&originHeight=343&originWidth=716&originalType=binary&ratio=1&rotation=0&showTitle=false&size=38605&status=done&style=none&taskId=uee7d2145-ec80-440f-b709-cb93ef466a0&title=&width=716)

### 5.3.2、DataID配置（工程里的配置文件名字）

#### 5.3.2.1、概念

Nacos 中的某个配置集的 ID，配置集 ID 是组织划分配置的维度之一。Data ID 通常用于组织划分系统的配置集。一个系统或者应用可以包含多个配置集，每个配置集都可以被一个有意义的名称标识。

> 注意：
>
> - 在系统中，一个配置文件通常就是一个配置集。一般微服务的配置就是一个配置集

#### 5.3.2.2、dataId的拼接格式

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359145535-a507388a-ddc9-4ff6-b6d9-cb26ef3ce145.png#averageHue=%23fefaf9&clientId=u9a57120e-e2d2-4&from=paste&height=160&id=ub6092a9b&name=image.png&originHeight=160&originWidth=996&originalType=binary&ratio=1&rotation=0&showTitle=false&size=66211&status=done&style=none&taskId=u6256b08d-22d1-4a4b-9803-fe16fae8f8e&title=&width=996)

> 解释：
>
> - prefix：默认为 spring.application.name 的值。
> - spring.profiles.active：即为当前环境对应的 profile。
> - file-extension：文件后缀

当activeprofile为空时。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359183915-fc847ef7-885d-4cfd-8da2-7a82c7892e81.png#averageHue=%23fef4f3&clientId=u9a57120e-e2d2-4&from=paste&height=256&id=ufb9fd17e&name=image.png&originHeight=256&originWidth=962&originalType=binary&ratio=1&rotation=0&showTitle=false&size=93137&status=done&style=none&taskId=u7ed87853-9f1e-41b8-9722-4701611a3d6&title=&width=962)

#### 5.3.2.3、新建DataID步骤

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359354524-4ed93161-2613-48e8-a704-eaf10a125024.png#averageHue=%23fbfafa&clientId=u9a57120e-e2d2-4&from=paste&height=447&id=u2455d88c&name=image.png&originHeight=447&originWidth=1892&originalType=binary&ratio=1&rotation=0&showTitle=false&size=73442&status=done&style=none&taskId=u9fe8d755-6f29-4116-9fe1-06eeb4471b4&title=&width=1892)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359405493-4181b2da-774d-4879-b383-bf37c88e5635.png#averageHue=%239e9e9e&clientId=u9a57120e-e2d2-4&from=paste&height=672&id=u005bf494&name=image.png&originHeight=672&originWidth=1647&originalType=binary&ratio=1&rotation=0&showTitle=false&size=46630&status=done&style=none&taskId=u481cf114-fcfb-4d43-a453-1a6d15db18b&title=&width=1647)

### 5.3.3.、Group分组方案(也可以实现环境区分，跟命名空间一个作用)

#### 5.3.3.1、概念

Nacos中的一组配置集，是组织配置的维度之一。通过一个有意义的字符串对配置集进行分组，从而区分Data ID相同的配置集。当您在 Nacos上创建一个配置时，如果未填写配置分组的名称，则配置分组的名称默认采用DEFAULT_GROUP 。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359468693-e7621425-7011-4963-a54f-c25dc7514a6b.png#averageHue=%23f0dcca&clientId=u9a57120e-e2d2-4&from=paste&height=308&id=u22a6faee&name=image.png&originHeight=308&originWidth=1020&originalType=binary&ratio=1&rotation=0&showTitle=false&size=88633&status=done&style=none&taskId=u6f5a5956-bbdf-4f28-aa4f-f97c3d735c5&title=&width=1020)

#### 5.3.3.2、通过Group实现环境区分

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359622179-5014feea-9a6a-4e19-9383-33e352e43f87.png#averageHue=%23a2a2a2&clientId=u9a57120e-e2d2-4&from=paste&height=674&id=ufbeb4aea&name=image.png&originHeight=674&originWidth=1572&originalType=binary&ratio=1&rotation=0&showTitle=false&size=47953&status=done&style=none&taskId=ub517b040-fe27-46ab-88b3-cc0e7171322&title=&width=1572)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359578035-18d0ce82-1952-4f4e-93df-75b28e903a9c.png#averageHue=%23a6a6a6&clientId=u9a57120e-e2d2-4&from=paste&height=702&id=u02b9bf7c&name=image.png&originHeight=702&originWidth=1729&originalType=binary&ratio=1&rotation=0&showTitle=false&size=54071&status=done&style=none&taskId=u41814724-8aec-40ac-a4a3-7a75d28671b&title=&width=1729)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359659974-4295689d-8721-459a-8e49-f8c307252dfe.png#averageHue=%23fc442e&clientId=u9a57120e-e2d2-4&from=paste&height=467&id=u5d94ef79&name=image.png&originHeight=467&originWidth=1524&originalType=binary&ratio=1&rotation=0&showTitle=false&size=89436&status=done&style=none&taskId=uf653b3bf-e084-4229-a96c-2ae1849329f&title=&width=1524)

### 5.3.4、Namespace实施方案(不同租户应对方案)

#### 5.3.4.1、实践方案

##### 5.3.4.1.1、面向一个租户

从一个租户(用户)的角度来看，如果有多套不同的环境，那么这个时候可以根据指定的环境来创建不同的 namespce，以此来实现多环境的隔离。
例如，你可能有dev，test和prod三个不同的环境，那么使用一套nacos 集群可以分别建以下三个不同的 namespace
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359809776-b17eed20-cc4f-4f73-a992-e7a166b8e173.png#averageHue=%23ededed&clientId=u9a57120e-e2d2-4&from=paste&height=656&id=u515b1255&name=image.png&originHeight=656&originWidth=1406&originalType=binary&ratio=1&rotation=0&showTitle=false&size=153330&status=done&style=none&taskId=u115ebb6f-233d-450c-8835-e17ad08b426&title=&width=1406)

> 问题：
> 这里的单租户同样也适于小型项目，或者是项目不太多时的实施方案，通过定义不同的环境，不同环境的项目在不同的Namespace下进行管理，不同环境之间通过Namespace进行隔离。

##### 5.3.4.1.2、面向多个租户

当多个项目同时使用该Nacos集群时，还可以通过Group进行Namespace内的细化分组。这里以 Namespace：dev 为例，在Namespace中通过不同Group进行同一环境中不同项目的再分类 。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668359861544-91e2c11f-81a7-450e-940a-546023134128.png#averageHue=%23eaeaea&clientId=u9a57120e-e2d2-4&from=paste&height=760&id=u9ce31dcc&name=image.png&originHeight=760&originWidth=1384&originalType=binary&ratio=1&rotation=0&showTitle=false&size=210318&status=done&style=none&taskId=ued86859e-a887-41ae-89b0-099875d50ee&title=&width=1384)

> 注意：
>
> - 通过上面的理论分析，可以看出方案二有很好的扩展性

# 6、Nacos Config动态刷新实现原理解析(源码分析)

## 6.1、动态监听

### 6.1.1、PUSH（推模式）

- 表示服务端主动将数据变更信息推送给客户端

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665338092754-89476f92-3c73-4dd7-9afd-0d979f17eb07.png#averageHue=%23f9e8db&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=204&id=u63175440&name=image.png&originHeight=255&originWidth=379&originalType=binary&ratio=1&rotation=0&showTitle=false&size=27321&status=error&style=none&taskId=uc3b0b95f-8301-4780-852f-7ba172a17e2&title=&width=303.2)

### 6.1.2、PULL（拉模式）

- 表示客户端主动去服务端拉取数据

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665338188833-a7131cc7-4ee3-4f09-baaf-7d7e68e9135b.png#averageHue=%23f8e6dd&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=214&id=u06ca2dc0&name=image.png&originHeight=267&originWidth=348&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25617&status=error&style=none&taskId=u56064e89-a61f-4717-89a5-e54fdda15a9&title=&width=278.4)
动态刷新机制：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665338317605-0aae39ab-d10c-4608-809d-b04b92d01856.png#averageHue=%23fcfcfc&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=413&id=u29d9adb2&name=image.png&originHeight=516&originWidth=1860&originalType=binary&ratio=1&rotation=0&showTitle=false&size=178943&status=error&style=none&taskId=u034e7b35-d6a5-4b96-b1cb-c4d908cf3b9&title=&width=1488)
动态刷新流程图
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1665338581159-81f194d6-863b-4371-8ad7-a766e706c998.png#averageHue=%23f2e9d2&clientId=u6dda5b27-3983-4&errorMessage=unknown%20error&from=paste&height=678&id=u0304e1ba&name=image.png&originHeight=847&originWidth=1581&originalType=binary&ratio=1&rotation=0&showTitle=false&size=743793&status=error&style=none&taskId=uf1dc5d29-29a6-40e4-a3ee-1e1c489efdd&title=&width=1264.8)

### 6.1.3、核心源码流程

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667207545879-3ee9bb15-1714-4665-a598-351f158d17ec.png#averageHue=%23f5f5f5&clientId=u3eb5303c-0975-4&from=paste&height=719&id=ucd1585c6&name=image.png&originHeight=899&originWidth=991&originalType=binary&ratio=1&rotation=0&showTitle=false&size=240375&status=done&style=none&taskId=u21865b00-1fd2-4e44-ac9f-f86ddab110e&title=&width=792.8)

### 6.1.4、核心源码阅读(1.4.0-beta)

源码查看：
[https://gitee.com/zhouzhz/nacos_ower_learn](https://gitee.com/zhouzhz/nacos_ower_learn)
[https://gitee.com/zhouzhz/spring-cloud-alibaba_ower_learn](https://gitee.com/zhouzhz/spring-cloud-alibaba_ower_learn)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668097086571-6d58f2c2-e4d2-4794-bd18-e21c5273969d.png#averageHue=%23f7f5ec&clientId=u4f537d25-c56c-4&from=paste&height=661&id=ud1305a17&name=image.png&originHeight=1322&originWidth=2250&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1193288&status=done&style=none&taskId=u9f8ca038-11b0-44f0-882b-435a72a8976&title=&width=1125)

#### 6.1.4.1、客户端发起长轮询

首先我们要先了解怎么看SpringBoot的相关自动装配源码，
第一步我们需要先去找到我们的spring.factories文件
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667227121015-6fe7dca0-f5c4-4315-a876-08bc8a493cf0.png#averageHue=%23566847&clientId=u550670b2-1c57-4&from=paste&height=627&id=u0ad9a734&name=image.png&originHeight=784&originWidth=1808&originalType=binary&ratio=1&rotation=0&showTitle=false&size=215006&status=done&style=none&taskId=uc468da52-4234-40f2-925a-d4496b93b65&title=&width=1446.4)
我们可以观察到有一个bootstrap的目录，是不是可以发现他是启动文件呢，所以我们先进入**NacosConfigBootstrapConfiguration**文件

```java
@Configuration(proxyBeanMethods = false)
//表示nacos配置中心是自动开启的
@ConditionalOnProperty(name = "spring.cloud.nacos.config.enabled", matchIfMissing = true)
public class NacosConfigBootstrapConfiguration {

	/**
	 * 是否开启了配置属性的bean
	 * @return
	 */
	@Bean
	@ConditionalOnMissingBean
	public NacosConfigProperties nacosConfigProperties() {
		return new NacosConfigProperties();
	}

	/**
	 * Nacos配置管理器，接收一个（依赖于）NacosConfigProperties，
	 * 并且创建（通过NacosFactory.createConfigService）、管理（提供getter）ConfigServer（配置服务器）对象。
	 * @param nacosConfigProperties
	 * @return
	 */
	@Bean
	@ConditionalOnMissingBean
	public NacosConfigManager nacosConfigManager(
			NacosConfigProperties nacosConfigProperties) {
		//nacos config管理类
		return new NacosConfigManager(nacosConfigProperties);
	}

	/**
	 * 1、Nacos Config通过使用Spring Cloud提供的PropertySourceLocator进行资源定位。
	 * 	  Nacos创建其实现类NacosPropertySourceLocator定位配置服务器上的配置文件。
	 * 2、PropertySourceLocator让spring读取我们自定义的配置文件（注册到Spring Environment)，
	 * 	  然后使用@Value注解即可读取到配置文件中的属性，这解释了为什么Nacos等配置中心可以直接使用Value注解进行配置的读取。
	 * 	  值得一提，这是基于SPI（Service Provider Interface）机制的，需要在META-INF/spring.factories中
	 * 	  定义BootstrapConfiguration**，所以Nacos Config也实现了一个BootstrapConfiguration，
	 * 	  其中就向Spring容器注册了NacosPropertySourceLocator这个Bean。
	 * 3、PropertySourceLocator中提供了方法locate，方法传入一个Environment对象（当前Spring应用环境），
	 * 	  返回一个PropertySource对象（配置源）。在Nacos实现的定位器中实现了从配置服务器加载配置的功能。分析源码得：
	 * 	  1、从NacosConfigManager获取ConfigServer对象，如果为空，返回null。
	 * 	  2、获取超时时间（spring.cloud.nacos.config.timeout）及配置文件名称（spring.cloud.nacos.config.name），
	 * 	  如未指定名称则使用前缀（spring.cloud.nacos.config.prefix），如果还是没有指定则使用应用名（spring.application.name）。
	 * 	  3、创建CompositePropertySource（表示一组配置源，继承于PropertySource，Name为NACOS）。
	 * 	  4、加载共享配置（loadSharedConfiguration）
	 * 	  	4.1、从配置文件中获取spring.cloud.nacos.config.shared-configs中的配置文件
	 * 	  	4.2、通过NacosPropertySourceBuilder构建配置源（如果可刷新的配置源不为0个（代表已加载过配置源）且不开启自动刷新，
	 * 	  	     从配置源仓库（NacosPropertySourceRepository）中加载）
	 * 	  	4.3、存入NacosPropertySourceRepository
	 * 	  5、加载拓展配置（loadExtConfiguration），类似于加载共享配置。
	 * 	  6、加载应用配置（loadApplicationConfiguration）
	 * 	  	 6.1、获取配置文件格式（spring.cloud.nacos.config.file-extension）
	 * 	 	 6.2、获取组（spring.cloud.nacos.config.group）
	 * 	  	 6.3、使用步骤2中获取的配置文件名称直接加载一次，存入NacosPropertySourceRepository
	 * 	  	 6.4、加上文件类型的后缀名加载一次，存入NacosPropertySourceRepository
	 * 	  	 6.5、对于所有活动的配置文件（Environment.getActiveProfiles）使用文件名-配置文件后缀.文件类型的作为配置名称进行加载，
	 * 	  		  存入NacosPropertySourceRepository
	 * 	  7、返回CompositePropertySource
	 *
	 * @param nacosConfigManager
	 * @return
	 */
	@Bean
	public NacosPropertySourceLocator nacosPropertySourceLocator(
			NacosConfigManager nacosConfigManager) {
		return new NacosPropertySourceLocator(nacosConfigManager);
	}

	/**
	 * Compatible with bootstrap way to start.
	 * 与启动方式兼容。
	*/
	@Bean
	@ConditionalOnMissingBean(search = SearchStrategy.CURRENT)
	@ConditionalOnNonDefaultBehavior
	public ConfigurationPropertiesRebinder smartConfigurationPropertiesRebinder(
			ConfigurationPropertiesBeans beans) {
		// If using default behavior, not use SmartConfigurationPropertiesRebinder.
		// Minimize te possibility of making mistakes.
		return new SmartConfigurationPropertiesRebinder(beans);
	}
}
```

我们可以发现它创建了一个Bean名为NacosConfigManager，并且内部有一个属性NacosConfigProperties，也是一起注入的。

```java
	@Bean
	@ConditionalOnMissingBean
	public NacosConfigManager nacosConfigManager(
			NacosConfigProperties nacosConfigProperties) {
		//nacos config管理类
		return new NacosConfigManager(nacosConfigProperties);
	}

```

该方法中创建了一个 NacosConfigManager 对象，NacosConfigManager 对象的构造方法中调用了 createConfigService(nacosConfigProperties) 方法，用于创建 ConfigService 对象。

```java
static ConfigService createConfigService(
			NacosConfigProperties nacosConfigProperties) {
		if (Objects.isNull(service)) {
			synchronized (NacosConfigManager.class) {
				try {
					if (Objects.isNull(service)) {
						//创建一个服务
						/**
						 * ConfigFactory:用于创建ConfigService，只有两个方法分别通过Porperties和serverAddr来创建配置服务。
						 * 				 但是其创建配置服务的具体实现在Porperty中（serverAddr被封装为Porperties）。
						 * 	1、通过反射获取了NacosConfigService（ConfigService的具体实现）这个类
						 *  2、调用类的构造方法创建实例（传入Porperties）
						 * 		1、检查Properties中CONTEXT_PATH属性是不是合法（不为空且没有两个’/'连在一起）
						 * 		2、从Properties中拿到编码默认为（UTF-8）
						 * 		3、从Properties中取出并且构造为命名空间放回Properties（是为了整合多租户和云端解析）
						 * 		4、创建ConfigFilterChainManager对象，这个类实现了IConfigFilterChain接口，管理一组IConfigFilter（按顺序对过滤器排序，内部将执行过滤器链任务委托给一个VirtualFilterChain实现）。创建时使用JDK6引入的ServiceLoader查找IConfigFilter。
						 * 		5、创建一个agent（MetricsHttpAgent），用于与服务器进行交互（基于HTTP协议），封装了通信细节。
						 * 		6、创建ClientWorker，提供了getServerConfig的实现，用于从配置服务器获取指定配置。
						 */
						service = NacosFactory.createConfigService(
								//配置服务属性
								nacosConfigProperties.assembleConfigServiceProperties());
					}
				}
				catch (NacosException e) {
					log.error(e.getMessage());
					throw new NacosConnectionFailureException(
							nacosConfigProperties.getServerAddr(), e.getMessage(), e);
				}
			}
		}
		return service;
	}
```

然后我们进去NacosFactory.createConfigService(nacosConfigProperties.assembleConfigServiceProperties())中，一直到最里面发现它是利用反射进行调用NacosConfigService(Properties)的这个构造方法

#### ![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667235293783-9ff67949-5487-4d31-b49e-464bcc6cb768.png#averageHue=%232e2c2b&clientId=u550670b2-1c57-4&from=paste&height=318&id=u0613c6dc&name=image.png&originHeight=397&originWidth=1151&originalType=binary&ratio=1&rotation=0&showTitle=false&size=63233&status=done&style=none&taskId=u918ae75a-3e1c-47f8-bf54-18f52520dbd&title=&width=920.8)

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667236117841-9c9e9972-8496-48e7-b1de-1ff447b0ef4a.png#averageHue=%232d2c2c&clientId=u550670b2-1c57-4&from=paste&height=392&id=u2693b906&name=image.png&originHeight=490&originWidth=935&originalType=binary&ratio=1&rotation=0&showTitle=false&size=76640&status=done&style=none&taskId=u815fbcd1-7ac8-4735-a40a-4213403e4ef&title=&width=748)
接着我们看最下面的核心方法**ClientWorker**的构造方法

```java
 public ClientWorker(final HttpAgent agent, final ConfigFilterChainManager configFilterChainManager,
                        final Properties properties) {
        this.agent = agent;
        this.configFilterChainManager = configFilterChainManager;

        // Initialize the timeout parameter
        // 里面初始化了长轮询的超时时间，默认为 30s
        init(properties);

        this.executor = Executors.newScheduledThreadPool(1, new ThreadFactory() {
            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r);
                t.setName("com.alibaba.nacos.client.Worker." + agent.getName());
                t.setDaemon(true);
                return t;
            }
        });

        this.executorService = Executors
            .newScheduledThreadPool(Runtime.getRuntime().availableProcessors(), new ThreadFactory() {
                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r);
                    t.setName("com.alibaba.nacos.client.Worker.longPolling." + agent.getName());
                    t.setDaemon(true);
                    return t;
                }
            });
        // 重要方法，初始化一个线程池，延迟 1 毫秒启动，之后每隔 10 毫秒执行一次，调用 checkConfigInfo() 方法
        this.executor.scheduleWithFixedDelay(new Runnable() {
            @Override
            public void run() {
                try {
                    checkConfigInfo();
                } catch (Throwable e) {
                    LOGGER.error("[" + agent.getName() + "] [sub-check] rotate check error", e);
                }
            }
        }, 1L, 10L, TimeUnit.MILLISECONDS);
    }
```

然后我们可以发现其最核心的方法就是checkConfigInfo()方法，

```java
 public void checkConfigInfo() {
        // Dispatch taskes   分派任务(监听队列)
        int listenerSize = cacheMap.get().size();
        // Round up the longingTaskCount.
        //向上取整，如果当前配置文件数小于3000，就只会用一个长轮训类，如果大于3000就会再创建一个。
        //(int)Math.ceil(2999/3000D)=1
        //(int)Math.ceil(5999/3000D)=2
        int longingTaskCount = (int) Math.ceil(listenerSize / ParamUtil.getPerTaskConfigSize());
        if (longingTaskCount > currentLongingTaskCount) {
            for (int i = (int) currentLongingTaskCount; i < longingTaskCount; i++) {
                // The task list is no order.So it maybe has issues when changing.
                //3000以内开一个长轮训线程，3000~6000开两， 创建了长轮询对象 LongPollingRunnable ，交由线程池执行
                executorService.execute(new LongPollingRunnable(i));
            }
            currentLongingTaskCount = longingTaskCount;
        }
    }
```

其中里面用到了一个map叫做cacheMap，如下：

```java
 /**
     * cacheMap 的主要作用是用来存储监听变更的缓存集合，为
     * 了保障线程安全使用了 ConcurrentHashMap 的结构。key 被称为 groupKey ，
     * 是由 dataId，group，tenant（租户）拼接而成的字符串； value 为 CacheData 对象，
     * 每个 dataId 都会持有一个 CacheData 对象。
     *
     *
     *
     * groupKey -> cacheData.
     * <p>
     * groupKey：dataId+group+tenant
     * cacheData：
     */
    private final AtomicReference<Map<String, CacheData>> cacheMap = new AtomicReference<Map<String, CacheData>>(
        new HashMap<String, CacheData>());

```

并且里面有一个长轮训对象，**LongPollingRunnable**，他是3000以内开一个长轮训线程，3000~6000开两， 创建了长轮询对象 LongPollingRunnable ，交由线程池执行。他也是一个线程对象，所以我们看其**run**方法

```java
 public void run() {
            //缓存的数据
            List<CacheData> cacheDatas = new ArrayList<CacheData>();
            //初始化的緩存集合（正在初始化CacheList）
            List<String> inInitializingCacheList = new ArrayList<String>();
            try {
                // check failover config  检查故障转移配, 遍历 cacheMap
                for (CacheData cacheData : cacheMap.get().values()) {

                    /**
                     * cacheData.getTaskId() ：小于3000为0，大于等于3000小于6000为1，以此类推
                     * taskId： 3000以内开一个长轮训线程，3000~6000开两个长轮训线程
                     * 第一次刚进来的时候是添加
                     */
                    if (cacheData.getTaskId() == taskId) {
                        cacheDatas.add(cacheData);
                        try {
                            // 校验本地文件
                            /**
                             * ①如果不使用本地配置，并且本地文件路径存在
                             *      1、从本地缓存文件中获取配置信息
                             *      2、设置 useLocalConfigInfo 为 true
                             *      3、设置本地配置的版本信息
                             *②如果本地使用本地配置，但是本地文件路径不存在
                             *      1、设置 useLocalConfigInfo 为 false 后直接返回
                             *③如果使用本地配置，本地缓存文件路径存在, 并且缓存的时间跟文件的更新时间不一致，说明有改变
                             *      1、设置 useLocalConfigInfo 为 true
                             *      2、设置本地配置的版本信息
                             *
                             */
                            checkLocalConfig(cacheData);
                            if (cacheData.isUseLocalConfigInfo()) {
                                //如果 isUseLocalConfigInfo 返回为 true, 表示缓存和本地配置不一致
                                cacheData.checkListenerMd5();
                            }
                        } catch (Exception e) {
                            LOGGER.error("get local config info error", e);
                        }
                    }
                }

                // check server config,调用三方服务/listener接口
                // 调用服务端接口：/v1/cs/configs/listener
                List<String> changedGroupKeys = checkUpdateDataIds(cacheDatas, inInitializingCacheList);
                if (!CollectionUtils.isEmpty(changedGroupKeys)) {
                    LOGGER.info("get changedGroupKeys:" + changedGroupKeys);
                }

                for (String groupKey : changedGroupKeys) {
                    String[] key = GroupKey.parseKey(groupKey);
                    String dataId = key[0];
                    String group = key[1];
                    String tenant = null;
                    if (key.length == 3) {
                        tenant = key[2];
                    }
                    try {
                        /**
                         * checkUpdateDataIds() 方法执行完成后，得到了有更新的 changedGroupKeys，循环 changedGroupKeys 列表，调用 getServerConfig() 方法，获取服务端的配置：
                         */
                        String[] ct = getServerConfig(dataId, group, tenant, 3000L);
                        CacheData cache = cacheMap.get().get(GroupKey.getKeyTenant(dataId, group, tenant));
                        cache.setContent(ct[0]);
                        if (null != ct[1]) {
                            cache.setType(ct[1]);
                        }
                        LOGGER.info("[{}] [data-received] dataId={}, group={}, tenant={}, md5={}, content={}, type={}",
                            agent.getName(), dataId, group, tenant, cache.getMd5(),
                            ContentUtils.truncateContent(ct[0]), ct[1]);
                    } catch (NacosException ioe) {
                        String message = String
                            .format("[%s] [get-update] get changed config exception. dataId=%s, group=%s, tenant=%s",
                                agent.getName(), dataId, group, tenant);
                        LOGGER.error(message, ioe);
                    }
                }
                for (CacheData cacheData : cacheDatas) {
                    if (!cacheData.isInitializing() || inInitializingCacheList
                        .contains(GroupKey.getKeyTenant(cacheData.dataId, cacheData.group, cacheData.tenant))) {
                        cacheData.checkListenerMd5();
                        cacheData.setInitializing(false);
                    }
                }
                inInitializingCacheList.clear();

                executorService.execute(this);

            } catch (Throwable e) {

                // If the rotation training task is abnormal, the next execution time of the task will be punished
                LOGGER.error("longPolling error : ", e);
                executorService.schedule(this, taskPenaltyTime, TimeUnit.MILLISECONDS);
            }
        }
```

首先我们先看run方法中调用的checkLocalConfig()和checkListenerMd5();

##### checkLocalConfig(cacheData)

```java
 private void checkLocalConfig(CacheData cacheData) {
        final String dataId = cacheData.dataId;
        final String group = cacheData.group;
        final String tenant = cacheData.tenant;
        // 获取本地文件路径
        File path = LocalConfigInfoProcessor.getFailoverFile(agent.getName(), dataId, group, tenant);
        // ①如果不使用本地配置，并且本地文件路径存在
        if (!cacheData.isUseLocalConfigInfo() && path.exists()) {
            // 从本地缓存文件中获取配置信息
            String content = LocalConfigInfoProcessor.getFailover(agent.getName(), dataId, group, tenant);
            final String md5 = MD5Utils.md5Hex(content, Constants.ENCODE);
            // 设置 useLocalConfigInfo 为 true
            cacheData.setUseLocalConfigInfo(true);
            // 设置本地配置的版本信息
            cacheData.setLocalConfigInfoVersion(path.lastModified());
            cacheData.setContent(content);

            LOGGER.warn(
                "[{}] [failover-change] failover file created. dataId={}, group={}, tenant={}, md5={}, content={}",
                agent.getName(), dataId, group, tenant, md5, ContentUtils.truncateContent(content));
            return;
        }

        // If use local config info, then it doesn't notify business listener and notify after getting from server.
        // ②如果本地使用本地配置，但是本地文件路径不存在
        if (cacheData.isUseLocalConfigInfo() && !path.exists()) {
            // 设置 useLocalConfigInfo 为 false 后直接返回
            cacheData.setUseLocalConfigInfo(false);
            LOGGER.warn("[{}] [failover-change] failover file deleted. dataId={}, group={}, tenant={}", agent.getName(),
                dataId, group, tenant);
            return;
        }

        // When it changed.
         //③如果使用本地配置，本地缓存文件路径存在, 并且缓存的时间跟文件的更新时间不一致，说明有改变
        if (cacheData.isUseLocalConfigInfo() && path.exists() && cacheData.getLocalConfigInfoVersion() != path
            .lastModified()) {
            String content = LocalConfigInfoProcessor.getFailover(agent.getName(), dataId, group, tenant);
            final String md5 = MD5Utils.md5Hex(content, Constants.ENCODE);
            // 设置 useLocalConfigInfo 为 true
            cacheData.setUseLocalConfigInfo(true);
            //设置本地配置的版本信息
            cacheData.setLocalConfigInfoVersion(path.lastModified());
            cacheData.setContent(content);
            LOGGER.warn(
                "[{}] [failover-change] failover file changed. dataId={}, group={}, tenant={}, md5={}, content={}",
                agent.getName(), dataId, group, tenant, md5, ContentUtils.truncateContent(content));
        }
    }
```

##### checkListenerMd5()

```java
 void checkListenerMd5() {
        for (ManagerListenerWrap wrap : listeners) {
            if (!md5.equals(wrap.lastCallMd5)) {
                /**
                 * 如果 md5 值不一样，则发送数据变更通知，调用 safeNotifyListener 方法
                 */
                safeNotifyListener(dataId, group, content, type, md5, wrap);
            }
        }
    }
```

```java
/**
     * 这个方法中，对 dataId 注册过监听的客户端推送变更后的数据内容。
     * 客户端接收通知后通过 receiveConfigInfo() 方法接收回调数据，处理自身业务。
     * @param dataId
     * @param group
     * @param content
     * @param type
     * @param md5
     * @param listenerWrap
     */
    private void safeNotifyListener(final String dataId, final String group, final String content, final String type,
            final String md5, final ManagerListenerWrap listenerWrap) {
        final Listener listener = listenerWrap.listener;
        // 创建一个 job 对象，用于异步执行
        Runnable job = new Runnable() {
            @Override
            public void run() {
                ClassLoader myClassLoader = Thread.currentThread().getContextClassLoader();
                ClassLoader appClassLoader = listener.getClass().getClassLoader();
                try {
                    if (listener instanceof AbstractSharedListener) {
                        AbstractSharedListener adapter = (AbstractSharedListener) listener;
                        adapter.fillContext(dataId, group);
                        LOGGER.info("[{}] [notify-context] dataId={}, group={}, md5={}", name, dataId, group, md5);
                    }
                    // 执行回调之前先将线程classloader设置为具体webapp的classloader，以免回调方法中调用spi接口是出现异常或错用（多应用部署才会有该问题）。
                    Thread.currentThread().setContextClassLoader(appClassLoader);

                    ConfigResponse cr = new ConfigResponse();
                    cr.setDataId(dataId);
                    cr.setGroup(group);
                    cr.setContent(content);
                    configFilterChainManager.doFilter(null, cr);
                    String contentTmp = cr.getContent();
                    listener.receiveConfigInfo(contentTmp);

                    // compare lastContent and content
                    // 如果是 AbstractConfigChangeListener ，创建 ConfigChangeEvent 对象
                    if (listener instanceof AbstractConfigChangeListener) {
                        //主要是把改变的文件和删除的文件找出来
                        Map data = ConfigChangeHandler.getInstance()
                                .parseChangeData(listenerWrap.lastContent, content, type);
                        ConfigChangeEvent event = new ConfigChangeEvent(data);
                        ((AbstractConfigChangeListener) listener).receiveConfigChange(event);
                        listenerWrap.lastContent = content;
                    }

                    listenerWrap.lastCallMd5 = md5;
                    LOGGER.info("[{}] [notify-ok] dataId={}, group={}, md5={}, listener={} ", name, dataId, group, md5,
                            listener);
                } catch (NacosException ex) {
                    LOGGER.error("[{}] [notify-error] dataId={}, group={}, md5={}, listener={} errCode={} errMsg={}",
                            name, dataId, group, md5, listener, ex.getErrCode(), ex.getErrMsg());
                } catch (Throwable t) {
                    LOGGER.error("[{}] [notify-error] dataId={}, group={}, md5={}, listener={} tx={}", name, dataId,
                            group, md5, listener, t.getCause());
                } finally {
                    Thread.currentThread().setContextClassLoader(myClassLoader);
                }
            }
        };

        final long startNotify = System.currentTimeMillis();
        try {
            if (null != listener.getExecutor()) {
                // 执行
                listener.getExecutor().execute(job);
            } else {
                job.run();
            }
        } catch (Throwable t) {
            LOGGER.error("[{}] [notify-error] dataId={}, group={}, md5={}, listener={} throwable={}", name, dataId,
                    group, md5, listener, t.getCause());
        }
        final long finishNotify = System.currentTimeMillis();
        LOGGER.info("[{}] [notify-listener] time cost={}ms in ClientWorker, dataId={}, group={}, md5={}, listener={} ",
                name, (finishNotify - startNotify), dataId, group, md5, listener);
    }
```

##### checkUpdateDataIds()

这个方法最后一行调用了一个方法checkUpdateConfigStr(),里面的逻辑是：

```java
  /**
     * Fetch the updated dataId list from server.
     *
     * @param probeUpdateString       updated attribute string value.
     * @param isInitializingCacheList initial cache lists.
     * @return The updated dataId list(ps: it maybe null).
     * @throws IOException Exception.
     */
    List<String> checkUpdateConfigStr(String probeUpdateString, boolean isInitializingCacheList) throws Exception {

        Map<String, String> params = new HashMap<String, String>(2);
        params.put(Constants.PROBE_MODIFY_REQUEST, probeUpdateString);
        Map<String, String> headers = new HashMap<String, String>(2);
        // 这里在请求头中塞了一个 "Long-Pulling-Timeout" 标识，这个是服务端长轮询的判断条件，非常重要
        headers.put("Long-Pulling-Timeout", "" + timeout);

        // told server do not hang me up if new initializing cacheData added in
        if (isInitializingCacheList) {
            headers.put("Long-Pulling-Timeout-No-Hangup", "true");
        }

        if (StringUtils.isBlank(probeUpdateString)) {
            return Collections.emptyList();
        }

        try {
            // In order to prevent the server from handling the delay of the client's long task,
            // increase the client's read timeout to avoid this problem.

            long readTimeoutMs = timeout + (long) Math.round(timeout >> 1);
            // 调用服务端接口：/v1/cs/configs/listener
            HttpRestResult<String> result = agent
                .httpPost(Constants.CONFIG_CONTROLLER_PATH + "/listener", headers, params, agent.getEncode(),
                    readTimeoutMs);

            if (result.ok()) {
                setHealthServer(true);
                return parseUpdateDataIdResponse(result.getData());
            } else {
                setHealthServer(false);
                LOGGER.error("[{}] [check-update] get changed dataId error, code: {}", agent.getName(),
                    result.getCode());
            }
        } catch (Exception e) {
            setHealthServer(false);
            LOGGER.error("[" + agent.getName() + "] [check-update] get changed dataId exception", e);
            throw e;
        }
        return Collections.emptyList();
    }
```

##### getServerConfig()

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667242495349-e63dcf12-944e-493c-9534-5ba2e3748b22.png#averageHue=%232f2d2c&clientId=u550670b2-1c57-4&from=paste&height=585&id=u25235ba7&name=image.png&originHeight=731&originWidth=942&originalType=binary&ratio=1&rotation=0&showTitle=false&size=138752&status=done&style=none&taskId=u770fd1ae-241a-4058-ac54-06ae273eb34&title=&width=753.6)
客户端发起长轮询的源码解析完成！！！

#### 6.1.4.2、服务端接收和响应长轮询请求

我们主要看com.alibaba.nacos.config.server.controller.ConfigController#listener这个方法，也就是nacos的/v1/cs/configs/listener接口。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667399615835-c0eb6f7d-9b04-49e3-a74a-4c84cd01400b.png#averageHue=%232d2c2c&clientId=uebeb13e7-f094-4&from=paste&height=605&id=u1f1448b6&name=image.png&originHeight=756&originWidth=860&originalType=binary&ratio=1&rotation=0&showTitle=false&size=119143&status=done&style=none&taskId=uddd3a305-3b47-46b9-9c2b-63b88bd3e76&title=&width=688)
在其最后一行调用了一个方法inner.doPollingConfig(request, response, clientMd5Map, probeModify.length());
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667400069107-76e15e89-d6bf-494a-8cee-062eb8547d4a.png#averageHue=%232e2d2c&clientId=uebeb13e7-f094-4&from=paste&height=636&id=u46343a01&name=image.png&originHeight=795&originWidth=963&originalType=binary&ratio=1&rotation=0&showTitle=false&size=140084&status=done&style=none&taskId=u38e6129b-347c-4074-b78d-b9d6cbad346&title=&width=770.4)
然后我们再看圈中的这个com.alibaba.nacos.config.server.service.LongPollingService#addLongPollingClient方法。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667400506855-37c93274-0e73-4736-af18-abc795012875.png#averageHue=%23322c2b&clientId=uebeb13e7-f094-4&from=paste&height=241&id=u8a63a937&name=image.png&originHeight=301&originWidth=1169&originalType=binary&ratio=1&rotation=0&showTitle=false&size=54008&status=done&style=none&taskId=u5443e078-4fed-47be-9753-b749212d15e&title=&width=935.2)

```java
 /**
     * Add LongPollingClient.
     * 该方法中，对 md5 进行比较，如果不相同，说明文件内容已经变更，调用 generateResponse() 直接响应客户端。
     * 如果配置项没有变更，创建一个 ClientLongPolling 对象，交给定时线程池处理
     *
     * @param req              HttpServletRequest.
     * @param rsp              HttpServletResponse.
     * @param clientMd5Map     clientMd5Map.
     * @param probeRequestSize probeRequestSize.
     */
    public void addLongPollingClient(HttpServletRequest req, HttpServletResponse rsp, Map<String, String> clientMd5Map,
            int probeRequestSize) {

        // str 就是客户端提交请求的超时时间,默认为 30s
        String str = req.getHeader(LongPollingService.LONG_POLLING_HEADER);
        String noHangUpFlag = req.getHeader(LongPollingService.LONG_POLLING_NO_HANG_UP_HEADER);
        String appName = req.getHeader(RequestUtil.CLIENT_APPNAME_HEADER);
        String tag = req.getHeader("Vipserver-Tag");
        int delayTime = SwitchService.getSwitchInteger(SwitchService.FIXED_DELAY_TIME, 500);

        // Add delay time for LoadBalance, and one response is returned 500 ms in advance to avoid client timeout.
        //实际的超时时间是 29.5s,被减去了 500ms,主要是考虑到网络请求等耗时
        long timeout = Math.max(10000, Long.parseLong(str) - delayTime);
        if (isFixedPolling()) {
            timeout = Math.max(10000, getFixedPollingInterval());
            // Do nothing but set fix polling timeout.
        } else {
            long start = System.currentTimeMillis();
            // 比较客户端文件的 md5 和服务端文件的 md5,如果不一样,直接返回客户端配置项有变更
            List<String> changedGroups = MD5Util.compareMd5(req, rsp, clientMd5Map);
            if (changedGroups.size() > 0) {
                generateResponse(req, rsp, changedGroups);
                LogUtil.CLIENT_LOG.info("{}|{}|{}|{}|{}|{}|{}", System.currentTimeMillis() - start, "instant",
                        RequestUtil.getRemoteIp(req), "polling", clientMd5Map.size(), probeRequestSize,
                        changedGroups.size());
                return;
            } else if (noHangUpFlag != null && noHangUpFlag.equalsIgnoreCase(TRUE_STR)) {
                LogUtil.CLIENT_LOG.info("{}|{}|{}|{}|{}|{}|{}", System.currentTimeMillis() - start, "nohangup",
                        RequestUtil.getRemoteIp(req), "polling", clientMd5Map.size(), probeRequestSize,
                        changedGroups.size());
                return;
            }
        }
        String ip = RequestUtil.getRemoteIp(req);

        // Must be called by http thread, or send response.
        final AsyncContext asyncContext = req.startAsync();

        // AsyncContext.setTimeout() is incorrect, Control by oneself
        asyncContext.setTimeout(0L);
        // 如果配置项没有变更,将客户端请求挂起,创建一个 ClientLongPolling 对象,交给定时线程池处理
        ConfigExecutor.executeLongPolling(
                new ClientLongPolling(asyncContext, clientMd5Map, ip, probeRequestSize, timeout, appName, tag));
    }
```

接着我们看一下最后一行的ClientLongPolling类，它实现了runnable接口，我们直接看其run方法。![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667400602144-cdc74094-69f8-4f32-acc4-bfdfff6b8f4c.png#averageHue=%23352c2c&clientId=uebeb13e7-f094-4&from=paste&height=162&id=ua4f1ab40&name=image.png&originHeight=202&originWidth=1345&originalType=binary&ratio=1&rotation=0&showTitle=false&size=42436&status=done&style=none&taskId=ue5f9e6f1-97cd-426c-9e24-756ecf01d2a&title=&width=1076)

```java
 @Override
        public void run() {
            asyncTimeoutFuture = ConfigExecutor.scheduleLongPolling(new Runnable() {
                @Override
                public void run() {
                    try {
                        getRetainIps().put(ClientLongPolling.this.ip, System.currentTimeMillis());

                        // Delete subsciber's relations.
                        allSubs.remove(ClientLongPolling.this);

                        if (isFixedPolling()) {
                            LogUtil.CLIENT_LOG
                                    .info("{}|{}|{}|{}|{}|{}", (System.currentTimeMillis() - createTime), "fix",
                                            RequestUtil.getRemoteIp((HttpServletRequest) asyncContext.getRequest()),
                                            "polling", clientMd5Map.size(), probeRequestSize);
                            // 校验 md5 ，判断配置文件内容是否变更
                            List<String> changedGroups = MD5Util
                                    .compareMd5((HttpServletRequest) asyncContext.getRequest(),
                                            (HttpServletResponse) asyncContext.getResponse(), clientMd5Map);
                            if (changedGroups.size() > 0) {
                                // 有变动
                                sendResponse(changedGroups);
                            } else {
                                // 没有变动
                                sendResponse(null);
                            }
                        } else {
                            LogUtil.CLIENT_LOG
                                    .info("{}|{}|{}|{}|{}|{}", (System.currentTimeMillis() - createTime), "timeout",
                                            RequestUtil.getRemoteIp((HttpServletRequest) asyncContext.getRequest()),
                                            "polling", clientMd5Map.size(), probeRequestSize);
                            sendResponse(null);
                        }
                    } catch (Throwable t) {
                        LogUtil.DEFAULT_LOG.error("long polling error:" + t.getMessage(), t.getCause());
                    }

                }

            }, timeoutTime, TimeUnit.MILLISECONDS);

            // ②将当前的长轮询对象放到 allSubs 中
            allSubs.add(this);
        }
```

我们可以观察到timeoutTime这个属性的值为：29.5s
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667400757940-4fe6c44f-849c-45fb-9f74-98032e5ac155.png#averageHue=%23333231&clientId=uebeb13e7-f094-4&from=paste&height=51&id=uffa98977&name=image.png&originHeight=64&originWidth=695&originalType=binary&ratio=1&rotation=0&showTitle=false&size=13835&status=done&style=none&taskId=ubc39da02-108c-40aa-87cf-e8bb2466aa6&title=&width=556)
所以我们知道了这个run方法里面创建了一个Runnable方法，并放入线程池中，每隔29.5s执行一次，如果无变更，就正常返回，如果有变更（md5比较不相同），则调用sendResponse(changedGroups);方法响应客户端

#### 6.1.4.3、用户主动发起配置变更

用户修改了数据，则会调用/v1/cs/configs接口，其代码在com.alibaba.nacos.config.server.controller.ConfigController#publishConfig，代码如下：

```java
 /**
     * Adds or updates non-aggregated data.
     * 用户主动发起配置变更
     *
     * @throws NacosException NacosException.
     */
    @PostMapping
    @Secured(action = ActionTypes.WRITE, parser = ConfigResourceParser.class)
    public Boolean publishConfig(HttpServletRequest request, HttpServletResponse response,
            @RequestParam(value = "dataId") String dataId, @RequestParam(value = "group") String group,
            @RequestParam(value = "tenant", required = false, defaultValue = StringUtils.EMPTY) String tenant,
            @RequestParam(value = "content") String content, @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "appName", required = false) String appName,
            @RequestParam(value = "src_user", required = false) String srcUser,
            @RequestParam(value = "config_tags", required = false) String configTags,
            @RequestParam(value = "desc", required = false) String desc,
            @RequestParam(value = "use", required = false) String use,
            @RequestParam(value = "effect", required = false) String effect,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "schema", required = false) String schema) throws NacosException {

        final String srcIp = RequestUtil.getRemoteIp(request);
        final String requestIpApp = RequestUtil.getAppName(request);
        srcUser = RequestUtil.getSrcUserName(request);
        // check tenant
        ParamUtils.checkTenant(tenant);
        ParamUtils.checkParam(dataId, group, "datumId", content);
        ParamUtils.checkParam(tag);
        Map<String, Object> configAdvanceInfo = new HashMap<String, Object>(10);
        MapUtils.putIfValNoNull(configAdvanceInfo, "config_tags", configTags);
        MapUtils.putIfValNoNull(configAdvanceInfo, "desc", desc);
        MapUtils.putIfValNoNull(configAdvanceInfo, "use", use);
        MapUtils.putIfValNoNull(configAdvanceInfo, "effect", effect);
        MapUtils.putIfValNoNull(configAdvanceInfo, "type", type);
        MapUtils.putIfValNoNull(configAdvanceInfo, "schema", schema);
        ParamUtils.checkParam(configAdvanceInfo);

        if (AggrWhitelist.isAggrDataId(dataId)) {
            LOGGER.warn("[aggr-conflict] {} attemp to publish single data, {}, {}", RequestUtil.getRemoteIp(request),
                    dataId, group);
            throw new NacosException(NacosException.NO_RIGHT, "dataId:" + dataId + " is aggr");
        }

        final Timestamp time = TimeUtils.getCurrentTime();
        String betaIps = request.getHeader("betaIps");
        ConfigInfo configInfo = new ConfigInfo(dataId, group, tenant, appName, content);
        configInfo.setType(type);
        if (StringUtils.isBlank(betaIps)) {
            if (StringUtils.isBlank(tag)) {
                persistService.insertOrUpdate(srcIp, srcUser, configInfo, time, configAdvanceInfo, true);
                //  调用通知方法 notifyConfigChange
                ConfigChangePublisher
                        .notifyConfigChange(new ConfigDataChangeEvent(false, dataId, group, tenant, time.getTime()));
            } else {
                persistService.insertOrUpdateTag(configInfo, tag, srcIp, srcUser, time, true);
                //  调用通知方法 notifyConfigChange
                ConfigChangePublisher.notifyConfigChange(
                        new ConfigDataChangeEvent(false, dataId, group, tenant, tag, time.getTime()));
            }
        } else {
            // beta publish
            persistService.insertOrUpdateBeta(configInfo, betaIps, srcIp, srcUser, time, true);
            //  调用通知方法 notifyConfigChange
            ConfigChangePublisher
                    .notifyConfigChange(new ConfigDataChangeEvent(true, dataId, group, tenant, time.getTime()));
        }
        ConfigTraceService
                .logPersistenceEvent(dataId, group, tenant, requestIpApp, time.getTime(), InetUtils.getSelfIP(),
                        ConfigTraceService.PERSISTENCE_EVENT_PUB, content);
        return true;
    }
```

我们可以发现notifyConfigChange在三个地方被调用了，他创建了一个ConfigDataChangeEvent事件，而大家应该知道ApplicationEvent事件吧，他就是这个，这里的这个notifyConfigChange事件是一个发布者，那么我们自然可以得知肯定有接收者。他的接收者就是AsyncNotifyService（com.alibaba.nacos.config.server.service.notify.AsyncNotifyService#AsyncNotifyService）的构造方法

```java
 @Autowired
    public AsyncNotifyService(ServerMemberManager memberManager) {
        this.memberManager = memberManager;

        // Register ConfigDataChangeEvent to NotifyCenter.
        NotifyCenter.registerToPublisher(ConfigDataChangeEvent.class, NotifyCenter.ringBufferSize);

        // Register A Subscriber to subscribe ConfigDataChangeEvent.
        NotifyCenter.registerSubscriber(new Subscriber() {

            @Override
            public void onEvent(Event event) {
                // Generate ConfigDataChangeEvent concurrently
                if (event instanceof ConfigDataChangeEvent) {
                    ConfigDataChangeEvent evt = (ConfigDataChangeEvent) event;
                    long dumpTs = evt.lastModifiedTs;
                    String dataId = evt.dataId;
                    String group = evt.group;
                    String tenant = evt.tenant;
                    String tag = evt.tag;
                    Collection<Member> ipList = memberManager.allMembers();

                    // In fact, any type of queue here can be
                    Queue<NotifySingleTask> queue = new LinkedList<NotifySingleTask>();
                    for (Member member : ipList) {
                        queue.add(new NotifySingleTask(dataId, group, tenant, tag, dumpTs, member.getAddress(),
                                evt.isBeta));
                    }
                    // 创建了一个 AsyncTask 对象,用于通知配置文件有变更的操作
                    ConfigExecutor.executeAsyncNotify(new AsyncTask(nacosAsyncRestTemplate, queue));
                }
            }

            @Override
            public Class<? extends Event> subscribeType() {
                return ConfigDataChangeEvent.class;
            }
        });
    }
```

哦我们可以发现其里面其实最主要的就是 ConfigExecutor.executeAsyncNotify(new AsyncTask(nacosAsyncRestTemplate, queue));这段代码，他new了一个AsyncTask类，这里面最主要的就是他继承了Runnable类，我们直接看他的run方法

```java
 @Override
        public void run() {
            executeAsyncInvoke();
        }
```

```java
 private void executeAsyncInvoke() {
            while (!queue.isEmpty()) {
                NotifySingleTask task = queue.poll();
                String targetIp = task.getTargetIP();
                if (memberManager.hasMember(targetIp)) {
                    // start the health check and there are ips that are not monitored, put them directly in the notification queue, otherwise notify
                    boolean unHealthNeedDelay = memberManager.isUnHealth(targetIp);
                    if (unHealthNeedDelay) {
                        // target ip is unhealthy, then put it in the notification list
                        ConfigTraceService.logNotifyEvent(task.getDataId(), task.getGroup(), task.getTenant(), null,
                                task.getLastModified(), InetUtils.getSelfIP(), ConfigTraceService.NOTIFY_EVENT_UNHEALTH,
                                0, task.target);
                        // get delay time and set fail count to the task
                        asyncTaskExecute(task);
                    } else {
                        Header header = Header.newInstance();
                        header.addParam(NotifyService.NOTIFY_HEADER_LAST_MODIFIED, String.valueOf(task.getLastModified()));
                        header.addParam(NotifyService.NOTIFY_HEADER_OP_HANDLE_IP, InetUtils.getSelfIP());
                        if (task.isBeta) {
                            header.addParam("isBeta", "true");
                        }
                        // 这里会调用 /v1/cs/communication/dataChange 接口,通知配置有变动
                        restTemplate.get(task.url, header, Query.EMPTY, String.class, new AsyncNotifyCallBack(task));
                    }
                }
            }
        }
```

因为哦我们呢可以发现他最终调用了/v1/cs/communication/dataChange接口，然后我们去看这个接口的实现com.alibaba.nacos.config.server.controller.CommunicationController#notifyConfigInfo

```java
 @GetMapping("/dataChange")
    public Boolean notifyConfigInfo(HttpServletRequest request, @RequestParam("dataId") String dataId,
            @RequestParam("group") String group,
            @RequestParam(value = "tenant", required = false, defaultValue = StringUtils.EMPTY) String tenant,
            @RequestParam(value = "tag", required = false) String tag) {
        dataId = dataId.trim();
        group = group.trim();
        String lastModified = request.getHeader(NotifyService.NOTIFY_HEADER_LAST_MODIFIED);
        long lastModifiedTs = StringUtils.isEmpty(lastModified) ? -1 : Long.parseLong(lastModified);
        String handleIp = request.getHeader(NotifyService.NOTIFY_HEADER_OP_HANDLE_IP);
        String isBetaStr = request.getHeader("isBeta");
        if (StringUtils.isNotBlank(isBetaStr) && trueStr.equals(isBetaStr)) {
            // 调用 dump() 方法
            dumpService.dump(dataId, group, tenant, lastModifiedTs, handleIp, true);
        } else {
            dumpService.dump(dataId, group, tenant, tag, lastModifiedTs, handleIp);
        }
        return true;
    }
```

dump 方法的内容如下：

```java
  public void dump(String dataId, String group, String tenant, long lastModified, String handleIp, boolean isBeta) {
        String groupKey = GroupKey2.getKey(dataId, group, tenant);
        // 主要方法在这里，创建了一个 task 任务
        dumpTaskMgr.addTask(groupKey, new DumpTask(groupKey, lastModified, handleIp, isBeta));
    }
```

我们继续进去addTask()方法，一直追溯com.alibaba.nacos.common.task.engine.NacosDelayTaskExecuteEngine#addTask的方法，而在当前类中的构造方法里面可以看到
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667412019290-e5be0776-cbd2-486e-84e4-2a5d8af62542.png#averageHue=%232d2c2b&clientId=uebeb13e7-f094-4&from=paste&height=214&id=u507e1713&name=image.png&originHeight=268&originWidth=1177&originalType=binary&ratio=1&rotation=0&showTitle=false&size=54708&status=done&style=none&taskId=u3e28f2f2-4913-4a96-a230-c98f07dda58&title=&width=941.6)
查看 ProcessRunnable 对象的 run 方法，会调用 processTasks() 方法。processTasks() 方法中又会调用 getProcessor 获取对应的任务处理器

```java
 @Override
        public void run() {
            try {
                processTasks();
            } catch (Throwable e) {
                getEngineLog().error(e.toString(), e);
            }
        }
```

```java
 protected void processTasks() {
        Collection<Object> keys = getAllTaskKeys();
        for (Object taskKey : keys) {
            AbstractDelayTask task = removeTask(taskKey);
            if (null == task) {
                continue;
            }
            // 获取任务处理器
            NacosTaskProcessor processor = getProcessor(taskKey);
            if (null == processor) {
                getEngineLog().error("processor not found for task, so discarded. " + task);
                continue;
            }
            try {
                // ReAdd task if process failed
                // 调用 process 方法，重要方法
                if (!processor.process(task)) {
                    retryFailedTask(taskKey, task);
                }
            } catch (Throwable e) {
                getEngineLog().error("Nacos task execute error : " + e.toString(), e);
                retryFailedTask(taskKey, task);
            }
        }
    }
```

我们进去processor.process(task)方法，可以发现他是一个接口NacosTaskProcessor，他有很多实现类，如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667412638766-ff2a4b6f-b3d3-49c5-8194-a11e8c6eda00.png#averageHue=%232e333d&clientId=uebeb13e7-f094-4&from=paste&height=334&id=u5622a16f&name=image.png&originHeight=418&originWidth=1186&originalType=binary&ratio=1&rotation=0&showTitle=false&size=97004&status=done&style=none&taskId=ud949fe95-7937-4698-ad63-87219d191b2&title=&width=948.8)
我们重点看一下DumpProcessor，其里面的实现方法process的代码如下：

```java
  @Override
    public boolean process(NacosTask task) {
        final PersistService persistService = dumpService.getPersistService();
        DumpTask dumpTask = (DumpTask) task;
        String[] pair = GroupKey2.parseKey(dumpTask.getGroupKey());
        String dataId = pair[0];
        String group = pair[1];
        String tenant = pair[2];
        long lastModified = dumpTask.getLastModified();
        String handleIp = dumpTask.getHandleIp();
        boolean isBeta = dumpTask.isBeta();
        String tag = dumpTask.getTag();

        ConfigDumpEvent.ConfigDumpEventBuilder build = ConfigDumpEvent.builder().namespaceId(tenant).dataId(dataId)
                .group(group).isBeta(isBeta).tag(tag).lastModifiedTs(lastModified).handleIp(handleIp);
        // 如果是 beta 版本，这里不考虑
        if (isBeta) {
            // beta发布，则dump数据，更新beta缓存
            ConfigInfo4Beta cf = persistService.findConfigInfo4Beta(dataId, group, tenant);

            build.remove(Objects.isNull(cf));
            build.betaIps(Objects.isNull(cf) ? null : cf.getBetaIps());
            build.content(Objects.isNull(cf) ? null : cf.getContent());

            return DumpConfigHandler.configDump(build.build());
        } else {
            // 如果 tag 不为空，这里不考虑
            if (StringUtils.isBlank(tag)) {
                ConfigInfo cf = persistService.findConfigInfo(dataId, group, tenant);

                build.remove(Objects.isNull(cf));
                build.content(Objects.isNull(cf) ? null : cf.getContent());
                build.type(Objects.isNull(cf) ? null : cf.getType());

                return DumpConfigHandler.configDump(build.build());
            } else {

                ConfigInfo4Tag cf = persistService.findConfigInfo4Tag(dataId, group, tenant, tag);

                build.remove(Objects.isNull(cf));
                build.content(Objects.isNull(cf) ? null : cf.getContent());

                return DumpConfigHandler.configDump(build.build());
            }
        }
    }
```

DumpConfigHandler.configDump(build.build()) 方法中的代码是：

```
  /**
     * trigger config dump event.
     *
     * @param event {@link ConfigDumpEvent}
     * @return {@code true} if the config dump task success , else {@code false}
     */
    public static boolean configDump(ConfigDumpEvent event) {
        final String dataId = event.getDataId();
        final String group = event.getGroup();
        final String namespaceId = event.getNamespaceId();
        final String content = event.getContent();
        final String type = event.getType();
        final long lastModified = event.getLastModifiedTs();
        // beta 版本的不考虑，
        if (event.isBeta()) {
            boolean result = false;
            if (event.isRemove()) {
                result = ConfigCacheService.removeBeta(dataId, group, namespaceId);
                // 记录日志
                if (result) {
                    ConfigTraceService.logDumpEvent(dataId, group, namespaceId, null, lastModified, event.getHandleIp(),
                            ConfigTraceService.DUMP_EVENT_REMOVE_OK, System.currentTimeMillis() - lastModified, 0);
                }
                return result;
            } else {
                result = ConfigCacheService
                        .dumpBeta(dataId, group, namespaceId, content, lastModified, event.getBetaIps());
                if (result) {
                    ConfigTraceService.logDumpEvent(dataId, group, namespaceId, null, lastModified, event.getHandleIp(),
                            ConfigTraceService.DUMP_EVENT_OK, System.currentTimeMillis() - lastModified,
                            content.length());
                }
            }

            return result;
        }
        if (StringUtils.isBlank(event.getTag())) {
            if (dataId.equals(AggrWhitelist.AGGRIDS_METADATA)) {
                AggrWhitelist.load(content);
            }

            if (dataId.equals(ClientIpWhiteList.CLIENT_IP_WHITELIST_METADATA)) {
                ClientIpWhiteList.load(content);
            }

            if (dataId.equals(SwitchService.SWITCH_META_DATAID)) {
                SwitchService.load(content);
            }

            boolean result;
            if (!event.isRemove()) {
                // 重要代码，调用 dump() 方法
                result = ConfigCacheService.dump(dataId, group, namespaceId, content, lastModified, type);

                if (result) {
 										// 记录日志
                    ConfigTraceService.logDumpEvent(dataId, group, namespaceId, null, lastModified, event.getHandleIp(),
                            ConfigTraceService.DUMP_EVENT_OK, System.currentTimeMillis() - lastModified,
                            content.length());
                }
            } else {
                result = ConfigCacheService.remove(dataId, group, namespaceId);

                if (result) {
                    ConfigTraceService.logDumpEvent(dataId, group, namespaceId, null, lastModified, event.getHandleIp(),
                            ConfigTraceService.DUMP_EVENT_REMOVE_OK, System.currentTimeMillis() - lastModified, 0);
                }
            }
            return result;
        } else {
            //
            boolean result;
            if (!event.isRemove()) {
                result = ConfigCacheService.dumpTag(dataId, group, namespaceId, event.getTag(), content, lastModified);
                if (result) {
                    ConfigTraceService.logDumpEvent(dataId, group, namespaceId, null, lastModified, event.getHandleIp(),
                            ConfigTraceService.DUMP_EVENT_OK, System.currentTimeMillis() - lastModified,
                            content.length());
                }
            } else {
                result = ConfigCacheService.removeTag(dataId, group, namespaceId, event.getTag());
                if (result) {
                    ConfigTraceService.logDumpEvent(dataId, group, namespaceId, null, lastModified, event.getHandleIp(),
                            ConfigTraceService.DUMP_EVENT_REMOVE_OK, System.currentTimeMillis() - lastModified, 0);
                }
            }
            return result;
        }

    }
```

最后面我们发现其最重要的两个方法就是

- dump() 方法保存配置文件并更新 md5
- ConfigTraceService.logDumpEvent() 方法记录日志

dump方法中最重要的就是updateMd5()
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667412952206-fa56e342-93f2-414e-8e32-25d445db163d.png#averageHue=%2395573c&clientId=uebeb13e7-f094-4&from=paste&height=465&id=ua06ad672&name=image.png&originHeight=581&originWidth=1288&originalType=binary&ratio=1&rotation=0&showTitle=false&size=132817&status=done&style=none&taskId=u4a39f33b-67d5-4127-ba19-f58b2481d89&title=&width=1030.4)
他的里面的实现为
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667412983309-204b5fbe-5d1f-4cdd-9207-5253ebe91cbe.png#averageHue=%232d2c2c&clientId=uebeb13e7-f094-4&from=paste&height=224&id=u9c22838d&name=image.png&originHeight=280&originWidth=913&originalType=binary&ratio=1&rotation=0&showTitle=false&size=44905&status=done&style=none&taskId=u02d2c695-24bd-4a32-9a6a-ab16e5da1aa&title=&width=730.4)
我们可以发现他发布了一个LocalDataChangeEvent 事件，这个事件的处理在于LongPollingService 这个类的无参构造方法中。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667413104621-e41365d6-ebf8-4ad1-85df-6a7ac1d8dea1.png#averageHue=%232f2c2b&clientId=uebeb13e7-f094-4&from=paste&height=571&id=u2b8a24f3&name=image.png&originHeight=714&originWidth=949&originalType=binary&ratio=1&rotation=0&showTitle=false&size=103133&status=done&style=none&taskId=u92e0c337-0ac2-4654-be50-ec6c24c0efd&title=&width=759.2)
我们又可以发现他又创建了一个线程对象DataChangeTask，我们是不是可以知道就看他的run方法即可
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667413166713-ab4fc0d7-9dd4-4df5-af08-032fe308d58f.png#averageHue=%232c2c2b&clientId=uebeb13e7-f094-4&from=paste&height=594&id=u775ae0bb&name=image.png&originHeight=743&originWidth=949&originalType=binary&ratio=1&rotation=0&showTitle=false&size=116328&status=done&style=none&taskId=u80017f1d-b0aa-4ef5-aae0-4cc689879e9&title=&width=759.2)
最终我们可以发生这块代码的整体逻辑是拿出队列中所有的长轮询对象并响应，客户端在接收到响应后会请求 **/v1/cs/configs **接口获取最新的配置。

# 7、Nacos领域模型解析

## 7.1、数据模型

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666114606280-a481980c-dc78-4d47-a0a1-b44b2905a131.png#averageHue=%23c8cfd2&clientId=ue91a6d20-e83d-4&errorMessage=unknown%20error&from=paste&height=366&id=u61f1a61a&name=image.png&originHeight=458&originWidth=903&originalType=binary&ratio=1&rotation=0&showTitle=false&size=150997&status=error&style=none&taskId=ue44753f2-c0f1-4582-a35a-c8fc6984a2d&title=&width=722.4)
解释：

| 概念      | 描述                                      |
| --------- | ----------------------------------------- |
| Namespace | 代表不同的运行环境，比如dev/test/uat/prod |
| Group     | 代表某一类配置，比如中间件、数据库配置    |
| DateId    | 某个项目中的具体的配置文件                |

## 7.2、分级存储模型

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666115152284-e90a411e-d1d9-4d7a-84a6-bd849627bade.png#averageHue=%2381817f&clientId=ue91a6d20-e83d-4&errorMessage=unknown%20error&from=paste&height=555&id=u777b7a0e&name=image.png&originHeight=694&originWidth=1177&originalType=binary&ratio=1&rotation=0&showTitle=false&size=1230418&status=error&style=none&taskId=ue84bae1d-6aaf-4f0f-a1d2-28b6cb621b2&title=&width=941.6)

## 7.3、服务领域模型

- Namespace：实现环境隔离，默认值public
- Group：不同的service可以组成一个Group，默认是Default-Group
- Service：服务名称
- Cluster：对指定的微服务虚拟划分，默认值Default

最佳实践
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666115227379-96a4f2d9-1a55-469a-a154-4561d454d68f.png#averageHue=%2389d1f1&clientId=ue91a6d20-e83d-4&errorMessage=unknown%20error&from=paste&height=542&id=u620900da&name=image.png&originHeight=678&originWidth=1284&originalType=binary&ratio=1&rotation=0&showTitle=false&size=387244&status=error&style=none&taskId=ubb5fbacf-05e1-4fbb-a4b7-ddf98abbcb3&title=&width=1027.2)

# 8、Nacos架构

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666204640804-97670810-e52d-49ca-be05-b113b1bbd42d.png#averageHue=%23fcfefd&clientId=uafd4650d-5804-4&errorMessage=unknown%20error&from=paste&height=536&id=u33391727&name=image.png&originHeight=670&originWidth=1467&originalType=binary&ratio=1&rotation=0&showTitle=false&size=563641&status=error&style=none&taskId=uf99a3fba-d59f-4849-85f6-ac4bf59f66d&title=&width=1173.6)

# 9、Nacos注册中心

## 9.1、通用注册中心原理

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667413435268-a6510c5a-4038-4ab2-b6fd-abbe0e9798cc.png#averageHue=%23d5d6d5&clientId=uebeb13e7-f094-4&from=paste&height=177&id=u814b8022&name=image.png&originHeight=221&originWidth=963&originalType=binary&ratio=1&rotation=0&showTitle=false&size=82123&status=done&style=none&taskId=u9c39218f-1f4f-49ec-9462-6953c9a0907&title=&width=770.4)

## 9.2、同产品的Dubbo的服务注册原理

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667413530741-c6ba61d7-b0ff-46da-bb02-0e12250208ad.png#averageHue=%23aec97c&clientId=uebeb13e7-f094-4&from=paste&height=497&id=ude2254cc&name=image.png&originHeight=621&originWidth=898&originalType=binary&ratio=1&rotation=0&showTitle=false&size=390369&status=done&style=none&taskId=u63afa22e-e2b8-4264-8324-b5ce9012e0e&title=&width=718.4)

## 9.3、Nacos的注册中心原理

整体图：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1666204702329-64648c5b-86a2-4605-b726-60838964107f.png#averageHue=%23ffffff&clientId=u04702941-f079-4&errorMessage=unknown%20error&from=paste&height=598&id=u5b806866&name=image.png&originHeight=748&originWidth=1763&originalType=binary&ratio=1&rotation=0&showTitle=false&size=334955&status=error&style=none&taskId=u082dd3a7-7666-49c2-98f2-8ed92a1406d&title=&width=1410.4)
时序图：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1667441928364-ac04f126-0084-43c5-9cfd-418ca93198bb.png#averageHue=%23f5f5f5&clientId=u8d1996c6-74b6-4&from=paste&height=694&id=u99e5b807&name=image.png&originHeight=868&originWidth=522&originalType=binary&ratio=1&rotation=0&showTitle=false&size=98796&status=done&style=none&taskId=u87b374e9-0928-4aa4-af68-01527203af7&title=&width=417.6)

## 9.4、源码解析

源码查看：
[https://gitee.com/zhouzhz/nacos_ower_learn](https://gitee.com/zhouzhz/nacos_ower_learn)
[https://gitee.com/zhouzhz/spring-cloud-alibaba_ower_learn](https://gitee.com/zhouzhz/spring-cloud-alibaba_ower_learn)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668097026069-f0358012-7419-45d0-9beb-acc95cf8a49d.png#averageHue=%23f6f6f1&clientId=u4f537d25-c56c-4&from=paste&height=708&id=LHoGY&name=image.png&originHeight=1416&originWidth=2556&originalType=binary&ratio=1&rotation=0&showTitle=false&size=923029&status=done&style=none&taskId=uf1414b81-6c0f-48c1-b990-fc8e48a3afd&title=&width=1278)

### 9.4.1、客户端源码解析

#### 9.4.1.1、老生常谈：spring.factories

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668012404226-ed89de40-292a-4399-9d1a-c469658bb32b.png#averageHue=%23586d4c&clientId=uf6c905b6-697e-4&from=paste&height=453&id=u771ccf9d&name=image.png&originHeight=906&originWidth=2764&originalType=binary&ratio=1&rotation=0&showTitle=false&size=382099&status=done&style=none&taskId=u696b3208-40d6-48f8-bc1c-04193fc3199&title=&width=1382)

#### 9.4.1.2、初入NacosServiceRegistryAutoConfiguration

我们可以发现NacosServiceRegistryAutoConfiguration里面有一个创建NacosAutoServiceRegistration的方法，具体代码如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668012467670-bd1aa14d-a3bc-448d-8cac-e4a8e029300e.png#averageHue=%232f2d2b&clientId=uf6c905b6-697e-4&from=paste&height=243&id=ue31e2f1b&name=image.png&originHeight=486&originWidth=1382&originalType=binary&ratio=1&rotation=0&showTitle=false&size=92161&status=done&style=none&taskId=ubd2da59b-a2ad-47a4-8eb4-a22e83e7c60&title=&width=691)
我们进入NacosAutoServiceRegistration中，发现他会继承一个AbstractAutoServiceRegistration类，而这个类他又实现了ApplicationListener接口
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668063186770-95c8c69c-80b1-420d-b2a7-6d25b074c17a.png#averageHue=%23313330&clientId=u4f537d25-c56c-4&from=paste&height=173&id=ue992528e&name=image.png&originHeight=345&originWidth=1071&originalType=binary&ratio=1&rotation=0&showTitle=false&size=123262&status=done&style=none&taskId=u552b5746-26c5-4be4-8548-2442985a09b&title=&width=535.5)
我们可以直接看其Event相关的方法
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668063273187-a6b3a9dc-a249-4f53-b4ea-8cc03cd87618.png#averageHue=%232d2c2b&clientId=u4f537d25-c56c-4&from=paste&id=ua29b5b7b&name=image.png&originHeight=99&originWidth=575&originalType=binary&ratio=1&rotation=0&showTitle=false&size=13357&status=done&style=none&taskId=u65ed8745-545a-4a7e-8068-f3ddbeba8f5&title=)
然后我们就可以确定到bind方法，代码如下：

```java
@Deprecated
public void bind(WebServerInitializedEvent event) {
    ApplicationContext context = event.getApplicationContext();
	if (!(context instanceof ConfigurableWebServerApplicationContext) || !"management".equals(((ConfigurableWebServerApplicationContext)context).getServerNamespace())) {
    	this.port.compareAndSet(0, event.getWebServer().getPort());
    	// 调用了 start 方法
        this.start();
	}
}
```

然后我们看其start方法，代码如下

```java
public void start() {
    // 判断是否已开启注册
    if (!this.isEnabled()) {
        if (logger.isDebugEnabled()) {
            logger.debug("Discovery Lifecycle disabled. Not starting");
        }
    } else {
        if (!this.running.get()) {
            this.context.publishEvent(new InstancePreRegisteredEvent(this, this.getRegistration()));
            // 调用 register() 方法
            this.register();
            if (this.shouldRegisterManagement()) {
                this.registerManagement();
            }
            this.context.publishEvent(new InstanceRegisteredEvent(this, this.getConfiguration()));
            this.running.compareAndSet(false, true);
        }
    }
}
```

#### 9.4.1.3、再入NacosServiceRegistry

然后我们直接去看关键代码（register()方法），他最终会调用com.alibaba.cloud.nacos.registry.NacosServiceRegistry#register

```java
@Override
	public void register(Registration registration) {

		if (StringUtils.isEmpty(registration.getServiceId())) {
			log.warn("No service to register for nacos client...");
			return;
		}

		NamingService namingService = namingService();
		String serviceId = registration.getServiceId();
		String group = nacosDiscoveryProperties.getGroup();

		Instance instance = getNacosInstanceFromRegistration(registration);

		try {
            // 调用 registerInstance() 方法
			namingService.registerInstance(serviceId, group, instance);
			log.info("nacos registry, {} {} {}:{} register finished", group, serviceId,
					instance.getIp(), instance.getPort());
		}
		catch (Exception e) {
			if (nacosDiscoveryProperties.isFailFast()) {
				log.error("nacos registry, {} register failed...{},", serviceId,
						registration.toString(), e);
				rethrowRuntimeException(e);
			}
			else {
				log.warn("Failfast is false. {} register failed...{},", serviceId,
						registration.toString(), e);
			}
		}
	}
```

#### 9.4.1.4、接着NamingProxy

我们由registerInstance方法点进去，然后一直往下走，会走到com.alibaba.nacos.client.naming.net.NamingProxy#registerService方法，具体流程如下
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668074757566-4d4f0e4a-bfb5-49dd-9be6-6242c633dd30.png#averageHue=%23312e2d&clientId=u4f537d25-c56c-4&from=paste&height=309&id=ub5f0a708&name=image.png&originHeight=618&originWidth=1011&originalType=binary&ratio=1&rotation=0&showTitle=false&size=118567&status=done&style=none&taskId=u19a93c6d-ec9a-4bfd-9b71-edee2eb9932&title=&width=505.5)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668074787507-acf4d312-cde5-4d1e-adb0-02bdb052d750.png#averageHue=%23322e2d&clientId=u4f537d25-c56c-4&from=paste&height=237&id=u1e3ceb22&name=image.png&originHeight=474&originWidth=1232&originalType=binary&ratio=1&rotation=0&showTitle=false&size=110892&status=done&style=none&taskId=u7eb2e395-cc7e-49ce-a5eb-b89b15de971&title=&width=616)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668074938901-61e63270-b3c6-4a46-9df8-3eaddb93e9ec.png#averageHue=%23544f46&clientId=u4f537d25-c56c-4&from=paste&height=169&id=ubc85ef67&name=image.png&originHeight=337&originWidth=1160&originalType=binary&ratio=1&rotation=0&showTitle=false&size=58638&status=done&style=none&taskId=u96fd9f67-1d54-4168-829d-7f78889a728&title=&width=580)
一直到最后com.alibaba.nacos.client.naming.net.NamingProxy#registerService

```java
public void registerService(String serviceName, String groupName, Instance instance) throws NacosException {
        
        NAMING_LOGGER.info("[REGISTER-SERVICE] {} registering service {} with instance: {}", namespaceId, serviceName,
                instance);
        //拼接参数
        final Map<String, String> params = new HashMap<String, String>(16);
        params.put(CommonParams.NAMESPACE_ID, namespaceId);
        params.put(CommonParams.SERVICE_NAME, serviceName);
        params.put(CommonParams.GROUP_NAME, groupName);
        params.put(CommonParams.CLUSTER_NAME, instance.getClusterName());
        params.put("ip", instance.getIp());
        params.put("port", String.valueOf(instance.getPort()));
        params.put("weight", String.valueOf(instance.getWeight()));
        params.put("enable", String.valueOf(instance.isEnabled()));
        params.put("healthy", String.valueOf(instance.isHealthy()));
        params.put("ephemeral", String.valueOf(instance.isEphemeral()));
        params.put("metadata", JacksonUtils.toJson(instance.getMetadata()));
        // 调用服务端的 /nacos/v1/ns/instance
        reqApi(UtilAndComs.nacosUrlInstance, params, HttpMethod.POST);
        
    }
```

最后客户端启动时注册服务的代码已经分析完成

### 9.4.2、服务端源码解析

#### 9.4.2.1、初入InstanceController

服务端的源码入口在于com.alibaba.nacos.naming.controllers.InstanceController#register，具体代码如下

```java
/**
     * Register new instance.
     *
     * @param request http request
     * @return 'ok' if success
     * @throws Exception any error during register
     */
    @CanDistro
    @PostMapping
    @Secured(parser = NamingResourceParser.class, action = ActionTypes.WRITE)
    public String register(HttpServletRequest request) throws Exception {
        // 获取 namespaceId 
        final String namespaceId = WebUtils
                .optional(request, CommonParams.NAMESPACE_ID, Constants.DEFAULT_NAMESPACE_ID);
        //获取serviceName
        final String serviceName = WebUtils.required(request, CommonParams.SERVICE_NAME);
        NamingUtils.checkServiceNameFormat(serviceName);
        //组装数据
        final Instance instance = parseInstance(request);
        //// 调用服务管理器的registerInstance 方法
        serviceManager.registerInstance(namespaceId, serviceName, instance);
        return "ok";
    }
```

#### 9.4.2.2、再入ServiceManager

接着我们就可以进入com.alibaba.nacos.naming.core.ServiceManager#registerInstance方法，具体代码如下

```java
/**
* Register an instance to a service in AP mode.
*
* <p>This method creates service or cluster silently if they don't exist.
*
* @param namespaceId id of namespace
* @param serviceName service name
* @param instance    instance to register
* @throws Exception any error occurred in the process
*/
public void registerInstance(String namespaceId, String serviceName, Instance instance) throws NacosException {
    // 创建一个空服务
    createEmptyService(namespaceId, serviceName, instance.isEphemeral());
    // 获取 service
    Service service = getService(namespaceId, serviceName);

    if (service == null) {
        throw new NacosException(NacosException.INVALID_PARAM,
                                 "service not found, namespace: " + namespaceId + ", service: " + serviceName);
    }
    // 具体的服务注册方法
    addInstance(namespaceId, serviceName, instance.isEphemeral(), instance);
}
```

##### 9.4.2.2.1、继续看createEmptyService方法

我们先看一下createEmptyService方法，一直到最里面的com.alibaba.nacos.naming.core.ServiceManager#createServiceIfAbsent这个方法
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668092370815-24d1984d-cf2e-44ef-a744-e156f74d6cf7.png#averageHue=%232b2b2b&clientId=u4f537d25-c56c-4&from=paste&height=388&id=u039770d0&name=image.png&originHeight=775&originWidth=874&originalType=binary&ratio=1&rotation=0&showTitle=false&size=115218&status=done&style=none&taskId=uc8fc60f5-b0fc-4031-ab4d-32a1b8f598f&title=&width=437)
接着我们再看putServiceAndInit(service);方法
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668092459557-6b96b02b-0ff7-44d3-92be-200547a134a6.png#averageHue=%232e2c2c&clientId=u4f537d25-c56c-4&from=paste&id=u8ed8493f&name=image.png&originHeight=232&originWidth=1008&originalType=binary&ratio=1&rotation=0&showTitle=false&size=54170&status=done&style=none&taskId=u9ca311f2-d718-4023-8e36-9cd52aa1e6b&title=)
然后进入putService方法，可以发现他是一个map，**先是尝试从一个 serviceMap 的对象中获取 service，不存在创建一个放入这个 serviceMap 中。**
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668092494464-1f11caea-d60f-49b2-823a-a6a036453e67.png#averageHue=%232c2c2b&clientId=u4f537d25-c56c-4&from=paste&id=u21881fa7&name=image.png&originHeight=369&originWidth=840&originalType=binary&ratio=1&rotation=0&showTitle=false&size=61426&status=done&style=none&taskId=u639e9bea-0e7b-4f08-a57d-30ef46a2d37&title=)
我们发现他有一个serviceMap，他是一个Map，并且是个**ConcurrentHashMap**。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668092634415-83dbd321-4fd6-486e-9836-f2c920a9dd06.png#averageHue=%232c2c2c&clientId=u4f537d25-c56c-4&from=paste&id=u36cf3d92&name=image.png&originHeight=140&originWidth=727&originalType=binary&ratio=1&rotation=0&showTitle=false&size=27984&status=done&style=none&taskId=u6c09332f-2b91-4177-a8ed-778c0314783&title=)

##### 9.4.2.2.2、继续看addInstance方法

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668093297430-9c2a494e-af8f-48a7-8905-6de56574dbbe.png#averageHue=%232c2c2c&clientId=u4f537d25-c56c-4&from=paste&height=298&id=ud8e7ca56&name=image.png&originHeight=595&originWidth=1476&originalType=binary&ratio=1&rotation=0&showTitle=false&size=126493&status=done&style=none&taskId=u3a62a2bd-74a8-4a01-b2cf-1f86f4675af&title=&width=738)
然后我们接着看com.alibaba.nacos.naming.consistency.DelegateConsistencyServiceImpl#put方法

```java
@Override
public void put(String key, Record value) throws NacosException {
    mapConsistencyService(key).put(key, value);
}
```

接着这里面会个判断，如果是以com.alibaba.nacos.naming.iplist.ephemeral.为开头就用EphemeralConsistencyService，否则就用PersistentConsistencyServiceDelegateImpl
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668094003150-8f836af7-538f-42e5-acfa-0e9cb51be19b.png#averageHue=%232f2d2c&clientId=u4f537d25-c56c-4&from=paste&height=702&id=ud33748cf&name=image.png&originHeight=1404&originWidth=2696&originalType=binary&ratio=1&rotation=0&showTitle=false&size=357054&status=done&style=none&taskId=u9951f741-2c3c-4a45-a4e1-9b09153ca94&title=&width=1348)
然后我们假设是第一种情况，他是EphemeralConsistencyService，他有个实现类叫做DistroConsistencyServiceImpl，类图如下：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668094188074-31d28aff-f050-49b1-9511-69194c7cb2b3.png#averageHue=%23302e2e&clientId=u4f537d25-c56c-4&from=paste&height=313&id=u60b821f3&name=image.png&originHeight=626&originWidth=1906&originalType=binary&ratio=1&rotation=0&showTitle=false&size=80291&status=done&style=none&taskId=uac8756bb-22bd-4ccb-b4c8-3d8119c5b05&title=&width=953)
我们先看其put方法
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668095013971-32d9fd9f-c647-4605-80ff-a4840e61b850.png#averageHue=%232d2c2c&clientId=u4f537d25-c56c-4&from=paste&height=144&id=ude509a43&name=image.png&originHeight=288&originWidth=1774&originalType=binary&ratio=1&rotation=0&showTitle=false&size=81665&status=done&style=none&taskId=u91c41511-fb8b-4b8b-bf27-bf63487c7d2&title=&width=887)
我们重点看其onPut方法
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668095063214-be4d49d2-1405-45f8-87c5-b18948f7bf95.png#averageHue=%232c2c2b&clientId=u4f537d25-c56c-4&from=paste&height=523&id=uf79f0f04&name=image.png&originHeight=1046&originWidth=950&originalType=binary&ratio=1&rotation=0&showTitle=false&size=145007&status=done&style=none&taskId=u3fc688e5-7872-4521-bbab-42aeff756e6&title=&width=475)
然后我们进入其addTask()方法，他会把提醒发到队列里面
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668095105671-1538a236-a9a0-4ab5-b0cf-f068ec372034.png#averageHue=%232c2b2b&clientId=u4f537d25-c56c-4&from=paste&height=410&id=uf3b2a571&name=image.png&originHeight=820&originWidth=1330&originalType=binary&ratio=1&rotation=0&showTitle=false&size=129757&status=done&style=none&taskId=u278b9160-ee60-4e62-a8e6-222096e0ec7&title=&width=665)
让我们来看一下tasks属性，他有一个属性如下

```java
  private BlockingQueue<Pair<String, DataOperation>> tasks = new ArrayBlockingQueue<>(1024 * 1024);
```

我们看到这里就发现他好像没有下一步了，那么他究竟在哪服务注册呢，我们接着看下面。

我们接口看这个类下面，DistroConsistencyServiceImpl的类下面有个init方法，他是@PostConstruct修饰，所以他是一进来这个构造方法就会初始化，如下：

```java
@PostConstruct
public void init() {
    GlobalExecutor.submitDistroNotifyTask(notifier);
}

```

这里面的submitDistroNotifyTask()方法里面是线程池调用方法
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668094774466-1d1baf98-f9ad-4cd6-9092-34e6fdb61abb.png#averageHue=%23342f2d&clientId=u4f537d25-c56c-4&from=paste&height=126&id=ud7e89b68&name=image.png&originHeight=252&originWidth=1148&originalType=binary&ratio=1&rotation=0&showTitle=false&size=46410&status=done&style=none&taskId=u6461c6d0-8658-4f49-bdef-789ce9d77ea&title=&width=574)
然后我们就可以知道notifier实现了Runnable，直接看com.alibaba.nacos.naming.consistency.ephemeral.distro.DistroConsistencyServiceImpl.Notifier#run方法

```java
@Override
public void run() {
    Loggers.DISTRO.info("distro notifier started");
 	// 死循环
    for (; ; ) {
        try {
             // 从阻塞队列中拿到一个 Pair 对象，调用 handle 方法
            Pair<String, DataOperation> pair = tasks.take();
            handle(pair);
        } catch (Throwable e) {
            Loggers.DISTRO.error("[NACOS-DISTRO] Error while handling notifying task", e);
        }
    }
}
```

我们直接看其最重要的方法handle()方法

```java
private void handle(Pair<String, DataOperation> pair) {
            try {
                String datumKey = pair.getValue0();
                DataOperation action = pair.getValue1();

                services.remove(datumKey);

                int count = 0;

                if (!listeners.containsKey(datumKey)) {
                    return;
                }

                for (RecordListener listener : listeners.get(datumKey)) {

                    count++;

                    try {
                        if (action == DataOperation.CHANGE) {
                            // 这里会调用 Service 类的 onChange 方法
                            listener.onChange(datumKey, dataStore.get(datumKey).value);
                            continue;
                        }

                        if (action == DataOperation.DELETE) {
                            // 这里会调用 Service 类的 onDelete 方法
                            listener.onDelete(datumKey);
                            continue;
                        }
                    } catch (Throwable e) {
                        Loggers.DISTRO.error("[NACOS-DISTRO] error while notifying listener of key: {}", datumKey, e);
                    }
                }

                if (Loggers.DISTRO.isDebugEnabled()) {
                    Loggers.DISTRO
                            .debug("[NACOS-DISTRO] datum change notified, key: {}, listener count: {}, action: {}",
                                    datumKey, count, action.name());
                }
            } catch (Throwable e) {
                Loggers.DISTRO.error("[NACOS-DISTRO] Error while handling notifying task", e);
            }
        }
```

然后他会调用com.alibaba.nacos.naming.core.Service#onChange方法，代码如下

```java
 @Override
    public void onChange(String key, Instances value) throws Exception {
        
        Loggers.SRV_LOG.info("[NACOS-RAFT] datum is changed, key: {}, value: {}", key, value);
        
        for (Instance instance : value.getInstanceList()) {
            
            if (instance == null) {
                // Reject this abnormal instance list:
                throw new RuntimeException("got null instance " + key);
            }
            //对权重进行处理
            if (instance.getWeight() > 10000.0D) {
                instance.setWeight(10000.0D);
            }
            
            if (instance.getWeight() < 0.01D && instance.getWeight() > 0.0D) {
                instance.setWeight(0.01D);
            }
        }
        //将注册的服务放在一个 clusterMap 的对象中
        updateIPs(value.getInstanceList(), KeyBuilder.matchEphemeralInstanceListKey(key));
        
        recalculateChecksum();
    }
```

我们继续看com.alibaba.nacos.naming.core.Service#updateIPs方法，他就是将注册的服务放在一个 clusterMap 的对象中。具体代码如下

```java
 /**
     * Update instances.
     * 更新实例
     *
     * @param instances instances
     * @param ephemeral whether is ephemeral instance
     */
    public void updateIPs(Collection<Instance> instances, boolean ephemeral) {
        Map<String, List<Instance>> ipMap = new HashMap<>(clusterMap.size());
        for (String clusterName : clusterMap.keySet()) {
            ipMap.put(clusterName, new ArrayList<>());
        }

        for (Instance instance : instances) {
            try {
                if (instance == null) {
                    Loggers.SRV_LOG.error("[NACOS-DOM] received malformed ip: null");
                    continue;
                }

                if (StringUtils.isEmpty(instance.getClusterName())) {
                    instance.setClusterName(UtilsAndCommons.DEFAULT_CLUSTER_NAME);
                }
            	//如果之前集群不存在，创建一个集群
                if (!clusterMap.containsKey(instance.getClusterName())) {
                    Loggers.SRV_LOG
                            .warn("cluster: {} not found, ip: {}, will create new cluster with default configuration.",
                                    instance.getClusterName(), instance.toJson());
                    Cluster cluster = new Cluster(instance.getClusterName(), this);
                    cluster.init();
                    getClusterMap().put(instance.getClusterName(), cluster);
                }

                List<Instance> clusterIPs = ipMap.get(instance.getClusterName());
                if (clusterIPs == null) {
                    clusterIPs = new LinkedList<>();
                    ipMap.put(instance.getClusterName(), clusterIPs);
                }

                clusterIPs.add(instance);
            } catch (Exception e) {
                Loggers.SRV_LOG.error("[NACOS-DOM] failed to process ip: " + instance, e);
            }
        }

        for (Map.Entry<String, List<Instance>> entry : ipMap.entrySet()) {
            //make every ip mine
            List<Instance> entryIPs = entry.getValue();
            //这里又会调用 updateIps 方法
            clusterMap.get(entry.getKey()).updateIps(entryIPs, ephemeral);
        }

        setLastModifiedMillis(System.currentTimeMillis());
        getPushService().serviceChanged(this);
        StringBuilder stringBuilder = new StringBuilder();

        for (Instance instance : allIPs()) {
            stringBuilder.append(instance.toIpAddr()).append("_").append(instance.isHealthy()).append(",");
        }

        Loggers.EVT_LOG.info("[IP-UPDATED] namespace: {}, service: {}, ips: {}", getNamespaceId(), getName(),
                stringBuilder.toString());

    }
```

我们继续看其里面的方法com.alibaba.nacos.naming.core.Cluster#updateIps，

```java
 /**
     * Update instance list.
     *
     * @param ips       instance list
     * @param ephemeral whether these instances are ephemeral
     */
    public void updateIps(List<Instance> ips, boolean ephemeral) {

        Set<Instance> toUpdateInstances = ephemeral ? ephemeralInstances : persistentInstances;

        HashMap<String, Instance> oldIpMap = new HashMap<>(toUpdateInstances.size());

        for (Instance ip : toUpdateInstances) {
            oldIpMap.put(ip.getDatumKey(), ip);
        }
        // 获取有更新的服务
        List<Instance> updatedIPs = updatedIps(ips, oldIpMap.values());
        if (updatedIPs.size() > 0) {
            for (Instance ip : updatedIPs) {
                Instance oldIP = oldIpMap.get(ip.getDatumKey());

                // do not update the ip validation status of updated ips
                // because the checker has the most precise result
                // Only when ip is not marked, don't we update the health status of IP:
                if (!ip.isMarked()) {
                    ip.setHealthy(oldIP.isHealthy());
                }

                if (ip.isHealthy() != oldIP.isHealthy()) {
                    // ip validation status updated
                    Loggers.EVT_LOG.info("{} {SYNC} IP-{} {}:{}@{}", getService().getName(),
                            (ip.isHealthy() ? "ENABLED" : "DISABLED"), ip.getIp(), ip.getPort(), getName());
                }

                if (ip.getWeight() != oldIP.getWeight()) {
                    // ip validation status updated
                    Loggers.EVT_LOG.info("{} {SYNC} {IP-UPDATED} {}->{}", getService().getName(), oldIP.toString(),
                            ip.toString());
                }
            }
        }
        // 获取新的服务
        List<Instance> newIPs = subtract(ips, oldIpMap.values());
        if (newIPs.size() > 0) {
            Loggers.EVT_LOG
                    .info("{} {SYNC} {IP-NEW} cluster: {}, new ips size: {}, content: {}", getService().getName(),
                            getName(), newIPs.size(), newIPs.toString());

            for (Instance ip : newIPs) {
                // 对每个新服务建立健康检查
                HealthCheckStatus.reset(ip);
            }
        }
        // 获取已经失效的服务
        List<Instance> deadIPs = subtract(oldIpMap.values(), ips);

        if (deadIPs.size() > 0) {
            Loggers.EVT_LOG
                    .info("{} {SYNC} {IP-DEAD} cluster: {}, dead ips size: {}, content: {}", getService().getName(),
                            getName(), deadIPs.size(), deadIPs.toString());

            for (Instance ip : deadIPs) {
                // 已经失效的服务移除健康检查
                HealthCheckStatus.remv(ip);
            }
        }

        toUpdateInstances = new HashSet<>(ips);

        // 将最终的结果替换现有的对象，这里的思想类似于 COW 思想，做到了读写分离不干扰
        if (ephemeral) {
            //临时实例
            ephemeralInstances = toUpdateInstances;
        } else {
            //持久实例
            persistentInstances = toUpdateInstances;
        }
    }
```

最后我们的服务注册就看完了。

### 9.4.3、服务注册使用

请看下列地址：[https://www.yuque.com/zhzbaishen/ldbu6i/pv38v3](https://www.yuque.com/zhzbaishen/ldbu6i/pv38v3)

# 10、Nacos扩展了解

## 10.1、CAP

**CAP**定理指出分布式系统不可能同时具有一致性、可用性和分区容错性。听起来很简单，但一致性、可用性、分区容错性到底是什么意思呢？确切地来说分布式系统又意味着什么呢？
在本文中，我们将介绍一个简单的分布式系统，并对分布式系统的可用性、一致性和分区容错性进行诠释。有关分布式系统和这三个属性的正式描述，请参阅 Gilbert 和 Lynch 的论文。
**分布式系统**
让我们来考虑一个非常简单的分布式系统，它由两台服务器G1和G2组成；这两台服务器都存储了同一个变量v，v的初始值为v0；G1和G2互相之间能够通信，并且也能与外部的客户端通信；我们的分布式系统的架构图如下图所示：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668177575613-271efa31-e3f2-4fc6-a649-be2bb766ca8b.png#averageHue=%23fcfcfc&clientId=u3dc4f024-a7e9-4&from=paste&id=u31b8ea58&name=image.png&originHeight=217&originWidth=296&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25838&status=done&style=none&taskId=u41a473f9-1ccc-4e22-bdf6-40d1c9f2a59&title=)
**一个简单的分布式系统**
客户端可以向任何服务器发出读写请求。服务器当接收到请求之后，将根据请求执行一些计算，然后把请求结果返回给客户端。譬如，下图是一个写请求的例子：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668177675996-a4611b18-3ad5-49e0-928e-7b6d81ba6629.png#averageHue=%23fbfbfa&clientId=u3dc4f024-a7e9-4&from=paste&id=u376dff4a&name=image.png&originHeight=261&originWidth=943&originalType=binary&ratio=1&rotation=0&showTitle=false&size=122000&status=done&style=none&taskId=ue3375777-ebd4-48ba-8dfc-9ecc3ca6544&title=)
客户端发起写请求
接着，下图是一个读请求的例子
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668177749399-333837ae-d199-4cb8-a6af-df03de18fe01.png#averageHue=%23fbfbfb&clientId=u3dc4f024-a7e9-4&from=paste&id=u9031fa5d&name=image.png&originHeight=263&originWidth=655&originalType=binary&ratio=1&rotation=0&showTitle=false&size=82611&status=done&style=none&taskId=u5464604e-0daf-4092-aa37-9ebd0b21055&title=)
客户端发起读请求
现在我们的分布式系统建立起来了，下面我们就来回顾一下分布式系统的可用性、一致性以及分区容错性的含义。

### 10.1.1、**一致性 (Consistency)**

> any read operation that begins after a write operation completes must return that value, or the result of a later write operation
> 在写入操作完成后开始的任何读取操作都必须返回该值，或返回稍后写入操作的结果


下图是一个不一致的分布式系统的例子:
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668177902874-7f8b5c51-3183-431b-b063-2842af238be1.png#averageHue=%23fafaf9&clientId=u3dc4f024-a7e9-4&from=paste&id=u88ca7d20&name=image.png&originHeight=274&originWidth=647&originalType=binary&ratio=1&rotation=0&showTitle=false&size=152918&status=done&style=none&taskId=uda8bd788-23cf-45df-a903-57d2ee6d4cb&title=)
**不一致的分布式系统**
客户端向G1发起写请求，将v的值更新为v1且得到G1的确认响应；当向G2发起读v的请求时，读取到的却是旧的值v0，与期待的v1不一致。
下图一致的分布式系统的例子:
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668177995483-a2bb4acc-b3c5-442a-9af3-218d4e89dbf4.png#averageHue=%23f8f5f1&clientId=u3dc4f024-a7e9-4&from=paste&id=u79d837a1&name=image.png&originHeight=273&originWidth=672&originalType=binary&ratio=1&rotation=0&showTitle=false&size=152317&status=done&style=none&taskId=ud5ab40d4-cb7d-46b0-8e2a-c1b726d7b47&title=)
**一致的分布式系统**
在这个系统中，G1在将确认响应返回给客户端之前，会先把v的新值复制给G2，这样，当客户端从G2读取v的值时就能读取到最新的值v1

### 10.1.2、可用性(**Availability**)-->可以理解为多机器/多中心等

> every request received by a non-failing node in the system must result in a response
> 系统中未发生故障的节点收到的每个请求都必须得到响应

也就是说，在一个可用的分布式系统中，客户端向其中一个服务器发起一个请求且该服务器未崩溃，那么这个服务器最终必须响应客户端的请求。

### 10.1.3、分区容错性 (Partition tolerance)

> the network will be allowed to lose arbitrarily many messages sent from one node to another
> 网络将被允许丢失从一个节点发送到另一个节点的任意多个消息

也就是说服务器G1和G2之间互相发送的任意消息都可能丢失。如果所有的消息都丢失了，那么我们的系统就变成了下图这样：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668180023964-bbe57de4-d5c2-40f4-8ac8-eadd07694263.png#averageHue=%23fcfcfb&clientId=u3dc4f024-a7e9-4&from=paste&id=uc7a0c677&name=image.png&originHeight=221&originWidth=281&originalType=binary&ratio=1&rotation=0&showTitle=false&size=46782&status=done&style=none&taskId=ud4044a2a-c3d3-4658-b9da-50734c98ed8&title=)
**网络分区**
为了满足分区容错性，我们的系统在任意的网络分区情况下都必须正常的工作。

### 10.1.4、AP模式（一般是这个）

简单理解为：服务可以不可用，一致性是必须要的

### 10.1.5、CP模式

简单理解为：服务必须可用，一致性是次要的，但是数据最终一定是一致性的

### CAP定理的证明

现在我们已经了解了一致性、可用性和分区容错性的概念，我们可以来证明一个系统不能同时满足这三种属性了。
假设存在一个同时满足这三个属性的系统，我们第一件要做的就是让系统发生网络分区，就像下图的情况一样：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668180637052-cce0caf9-011e-4990-a7ef-fdc016200e57.png#averageHue=%23fcfcfc&clientId=u3dc4f024-a7e9-4&from=paste&height=234&id=u2463ff01&name=image.png&originHeight=468&originWidth=568&originalType=binary&ratio=1&rotation=0&showTitle=false&size=70252&status=done&style=none&taskId=u2f3bb038-837a-41cc-a20c-7b301914db3&title=&width=284)
网络分区
客户端向G1发起写请求，将v的值更新为v1，因为系统是可用的，所以G1必须响应客户端的请求，但是由于网络是分区的，G1无法将其数据复制到G2
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668180678399-d21f36b5-9473-4286-8f52-b32f8e0fe662.png#averageHue=%23fbfafa&clientId=u3dc4f024-a7e9-4&from=paste&height=283&id=ufcc23301&name=image.png&originHeight=566&originWidth=1946&originalType=binary&ratio=1&rotation=0&showTitle=false&size=476427&status=done&style=none&taskId=u1e43fc9e-93f6-42b2-b83b-337cd1a583f&title=&width=973)
由于网络分区导致不一致
接着，客户端向G2发起读v的请求，再一次因为系统是可用的，所以G2必须响应客户端的请求，又由于网络是分区的，G2无法从G1更新v的值，所以G2返回给客户端的是旧的值v0
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668180728720-d9915044-08a6-4559-bebc-02e8e86f113d.png#averageHue=%23fbfbfb&clientId=u3dc4f024-a7e9-4&from=paste&height=281&id=udabfd225&name=image.png&originHeight=562&originWidth=1598&originalType=binary&ratio=1&rotation=0&showTitle=false&size=358691&status=done&style=none&taskId=ubb8a1a7b-bbb7-4b3b-9fea-c29d5a46067&title=&width=799)
由于网络分区导致不一致
客户端发起写请求将G1上v的值修改为v1之后，从G2上读取到的值仍然是v0，这违背了一致性。

### 总结

我们假设了存在一个满足一致性、可用性、分区容错性的分布式系统，但是我们展示了在一些情况下，系统表现出不一致的行为，因此证明不存在这样一个系统
对于一个分布式系统来说，P 是一个基本要求，CAP 三者中，只能根据系统要求在 C 和 A 两者之间做权衡，并且要想尽办法提升 P

## 10.2、BASE原则

BASE 是 **Basically Available(基本可用)、Soft state(软状态)和 Eventually consistent (最终一致性)**三个短语的缩写。

- **基本可用（Basically Available）:**
  分布式系统在出现故障时，允许损失 **部分可用功能**，保证核心功能可用。举例如下：
  **1. 响应时间上的损失（可用，但查询比平时慢）：**正常情况下，搜索引擎会在0.5秒内返回查询结果给用户，但由于出现故障（比如系统部分机房发生断电或断网故障），查询结果的响应时间增加到了1~2秒。
  **2. 功能上的损失：**在正常情况下，用户可以在一个电商网站上顺利完成每一笔订单。但是到了大促期间，为了保护购物系统的稳定性，部分消费者可能会被引导到一个降级页面。
- **软状态（Soft state）：**
  软状态是指允许系统中的数据存在中间状态，并认为该中间状态的存在不会影响系统的整体可用性，即允许系统在不同的数据副本之间进行数据同步的过程存在延时。
- **最终一致性（Eventually consistent）：**
  最终一致性强调的是系统中所有的数据副本，在经过一段时间的同步后，最终能够达到一个一致的状态。因此，最终一致性的本质是需要系统保证最终数据能够达到一致，而不需要实时保证系统数据的强一致性。
  在实际工程实践中，最终一致性分为5种：

1. 因果一致性（Causal consistency）
   因果一致性指的是：如果节点A在更新完某个数据后通知了节点B，那么节点B之后对该数据的访问和修改都是基于A更新后的值。于此同时，和节点A无因果关系的节点C的数据访问则没有这样的限制。
2. 读己之所写（Read your writes）
   读己之所写指的是：节点A更新一个数据后，它自身总是能访问到自身更新过的最新值，而不会看到旧值。其实也算一种因果一致性。
3. 会话一致性（Session consistency）
   会话一致性将对系统数据的访问过程框定在了一个会话当中：系统能保证在同一个有效的会话中实现 “读己之所写” 的一致性，也就是说，执行更新操作之后，客户端能够在同一个会话中始终读取到该数据项的最新值。
4. 单调读一致性（Monotonic read consistency）
   单调读一致性指的是：如果一个节点从系统中读取出一个数据项的某个值后，那么系统对于该节点后续的任何数据访问都不应该返回更旧的值。
5. 单调写一致性（Monotonic write consistency）
   单调写一致性指的是：一个系统要能够保证来自同一个节点的写操作被顺序的执行。

## 10.3、Raft协议讲解

### 10.3.1、作用

- 用于解决分布式系统中的一致性问题
- 《In Search of and Understandable Consensus Algorithm》这篇论文中初次提到

### 10.3.2、选举过程

详细流程，请看动图：[http://thesecretlivesofdata.com/raft/](http://thesecretlivesofdata.com/raft/)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668182676940-e48b4acd-e245-4217-8d2a-82f238d4ec78.png#averageHue=%23f5f5eb&clientId=u3dc4f024-a7e9-4&from=paste&height=533&id=u605007e7&name=image.png&originHeight=1066&originWidth=1528&originalType=binary&ratio=1&rotation=0&showTitle=false&size=528711&status=done&style=none&taskId=u604ca98e-43cf-483d-98a7-53037fd5e32&title=&width=764)

### 10.3.3、raft协议详细了解

[https://www.cnblogs.com/xybaby/p/7153755.html](https://www.cnblogs.com/xybaby/p/7153755.html)
[https://blog.csdn.net/yangmengjiao_/article/details/120191314](https://blog.csdn.net/yangmengjiao_/article/details/120191314)

# 11、阿里为什么使用Nacos而不用zookeeper

## 11.1、发展历史

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668239293231-b571b24d-94c1-4233-9d9c-a194038539c7.png#averageHue=%23f3f2f2&clientId=uafbb8467-7793-4&from=paste&height=367&id=u4bfa9db7&name=image.png&originHeight=734&originWidth=1653&originalType=binary&ratio=1&rotation=0&showTitle=false&size=231396&status=done&style=none&taskId=ue4b8b615-5ef7-426c-b842-620af90c32b&title=&width=826.5)

## 11.2、注册中心要AP还是CP？

我们拿CAP理论去探讨，首先看

- 数据一致性需求分析
  - Si=F(service-name)
  - endpoints(ip:port)=SI
  - ![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668243312682-5d00af87-4310-4645-a66a-618d0cad76dd.png#averageHue=%23345151&clientId=uafbb8467-7793-4&from=paste&height=398&id=u72b734f5&name=image.png&originHeight=795&originWidth=1237&originalType=binary&ratio=1&rotation=0&showTitle=false&size=374839&status=done&style=none&taskId=ua5387c3d-5999-450d-9372-3b36578ce89&title=&width=618.5)

解释：一般情况下我们是通过服务名去换取服务的IP和端口，然后这个过程如果不一致的话，就会导致我们两个消费者获取的服务的IP和端口各有不同，从而导致服务请求不可用。

- 分区容忍性分析及可用性需求分析

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668261392644-a73cc017-f0e0-410c-97e7-caa3bd33e37c.png#averageHue=%23345151&clientId=uafbb8467-7793-4&from=paste&height=328&id=u52c6cb29&name=image.png&originHeight=656&originWidth=963&originalType=binary&ratio=1&rotation=0&showTitle=false&size=418076&status=done&style=none&taskId=u119108cc-9e97-4d1e-938e-2e35ad697f2&title=&width=481.5)
解释：就是多个机房，其中有一个机房跟其他机房不互联，导致多个机房之间的机器不互通，所以多中心就会有影响，不过一般情况下，实际过程是杭州机房只会有杭州机器的注册中心，不会有北京的机器。

## 11.3、服务规模、容量和连通性

- Zookeeper写操作是不可水平扩展的

## 11.4、注册中心是否需要持久存储和事务日志

- Zookeeper的ZAB协议保证每次请求都会写日志到每个节点
- 定期将内存数据镜像到磁盘做持久化
- 宕机重启后自动加载数据并恢复
- 在服务发现的场景下，服务列表数据是否有必要持久化？
  - 答案是不用，就比如nacos的是map，名为serviceMap

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668264597555-4bef81d0-cc9c-4ffa-b9de-f5e8d4a3eb5b.png#averageHue=%23365353&clientId=uafbb8467-7793-4&from=paste&height=395&id=u251d0cde&name=image.png&originHeight=790&originWidth=1080&originalType=binary&ratio=1&rotation=0&showTitle=false&size=357439&status=done&style=none&taskId=u6657913d-6724-4e2c-97be-d0928461b70&title=&width=540)

## 11.5、服务健康检查

- Zookeeper的服务健康检查是基于TCP长连接活性探测
- Nacos是服务提供者主动发起心跳来保活

## 11.6、注册中心的容灾

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668264824068-be4378d7-409b-4997-bdcd-95e3800cc0ac.png#averageHue=%23365455&clientId=uafbb8467-7793-4&from=paste&height=388&id=u15a80eb1&name=image.png&originHeight=775&originWidth=1148&originalType=binary&ratio=1&rotation=0&showTitle=false&size=493449&status=done&style=none&taskId=ucbfe6eab-bad6-4a4a-9af3-0c79b8e6e59&title=&width=574)

- 客户端应有针对注册中心不可用时的容灾手段
- Zookeeper的原生客户端并不具有这样的能力
- Nacos的客户端具备本地缓存

## 11.7、结论

- Zookeeper只支持CP模式，Nacos支持两种
- Zookeeper的事务机制和两阶段提交性能远低于Nacos
- Nacos的服务端主动心跳机制远于Zookeeper基于TCP探活
- Nacos的客户端会缓存服务列表，当注册中心不可用时起到灾备的作用，而Zookeeper原生客户端并不具备。

# 12、Nacos在跨DC部署中的应用

## 12.1、什么是跨DC调用

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668265502236-9555e245-94de-424f-8173-3a006ead7a77.png#averageHue=%23f7f3e3&clientId=uafbb8467-7793-4&from=paste&height=418&id=u20358ded&name=image.png&originHeight=835&originWidth=1236&originalType=binary&ratio=1&rotation=0&showTitle=false&size=342794&status=done&style=none&taskId=u935271a0-c343-4f13-b544-eda9e38b796&title=&width=618)

## 12.2、如何解决跨DC调用

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668265596217-25d6cb44-bb1c-4561-b30c-00f112231564.png#averageHue=%23f8f4e6&clientId=uafbb8467-7793-4&from=paste&height=404&id=uf69c5a16&name=image.png&originHeight=807&originWidth=1347&originalType=binary&ratio=1&rotation=0&showTitle=false&size=291239&status=done&style=none&taskId=u2ba7e7d6-f264-483d-9551-3f6916b6d38&title=&width=673.5)

## 12.3、什么是CMDB?

- Configuration Management Database
- 企业存放与机器设备、应用、服务等元数据
- 机器IP、主机名、机房、应用等
- 供运维或者监控平台使用这些数据进行展示和运维操作

## 12.4、CMDB相关概念

- Entity可以指一个IP、应用或者服务。包含很多属性
- Entity Type不限定在IP、应用。也可以根据业务自定义
- LABEL定义为一个描述Entity实行的K-V键值对
- Entity Event当实体属性发生变化时发出的消息

## 12.5、Nacos与CMDB整合？

### 12.5.1、了解Nacos CMDB SPI机制

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668265960260-7970a17d-a344-4bdd-aa34-78033fccbb09.png#averageHue=%23daf1c5&clientId=uafbb8467-7793-4&from=paste&height=403&id=u74d208f7&name=image.png&originHeight=806&originWidth=552&originalType=binary&ratio=1&rotation=0&showTitle=false&size=128444&status=done&style=none&taskId=u084cd943-7a67-4557-adc9-57616cc77ad&title=&width=276)
Nacos 定义了一个 SPI 接口，里面包含了与第三方 CMDB 约定的一些方法。用户依照约定实现了相应的 SPI 接口后可实现 Nacos 与 CMDB 的数据打通。
SPI定义
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668266098524-28c8ea51-2e93-440c-a02c-22ec8de95e71.png#averageHue=%23424547&clientId=uafbb8467-7793-4&from=paste&id=u8b3a7d0b&name=image.png&originHeight=195&originWidth=489&originalType=binary&ratio=1&rotation=0&showTitle=false&size=38783&status=done&style=none&taskId=u685cb6c7-afbd-40f5-a701-bcacbc8a545&title=)

#### 12.5.1.1、获取标签列表

> Set<String> getLabelNames()

- 这个方法将返回 CMDB 中需要被 Nacos 识别的标签名集合，CMDB 插件可以按需决定返回什么标签个 Nacos。不在这个集合的标签将会被 Nacos 忽略，即使这个标签出现在实体的属性里。我们允许这个集合会在运行时动态变化，Nacos 会定时去调用这个接口刷新标签集合。

#### 12.5.1.2、获取实体类型

> Set<String> getEntityTypes()

- 获取 CMDB 里的实体的类型集合，不在这个集合的实体类型会被 Nacos 忽略。服务发现模块目前需要的实体类似是 ip，如果想要通过打通 CMDB 数据来实现服务的高级负载均衡，请务必在返回集合里包含“ip”。

#### 12.5.1.3、获取标签详情

> Label getLabel(String labelName)

- 获取标签的详细信息。返回的 Label 类里包含标签的名字和标签值的集合。如果某个实体的这个标签的值不在标签值集合里，将会被视为无效。

#### 12.5.1.4、查询实体的标签值

> String getLabelValue(String entityName, String entityType, String labelName);
> Map<String, String> getLabelValues(String entityName, String entityType);

- 这里包含两个方法，一个是获取实体某一个标签名对应的值，一个是获取实体所有标签的键值对。参数里包含实体的值和实体的类型。注意，这个方法并不会在每次在 Nacos 内部触发查询时去调用，Nacos 内部有一个 CMDB 数据的缓存，只有当这个缓存失效或者不存在时，才会去访问 CMDB 插件查询数据。为了让 CMDB 插件的实现尽量简单，我们在Nacos 内部实现了相应的缓存和刷新逻辑。

#### 12.5.1.5、查询实体

> Map<String, Map<String, Entity>> getAllEntities();
> Entity getEntity(String entityName, String entityType);

- 查询实体包含两个方法：查询所有实体和查询单个实体。查询单个实体目前其实就是查询这个实体的所有标签，不过我们将这个方法与获取所有标签的方法区分开来，因为查询单个实体方法后面可能会进行扩展，比查询所有标签获取的信息要更多。
- 查询所有实体则是一次性将 CMDB 的所有数据拉取过来，该方法可能会比较消耗性能，无论是对于 Nacos 还是 CMDB。Nacos 内部调用该方法的策略是通过可配置的定时任务周期来定时拉取所有数据，在实现该 CMDB 插件时，也请关注 CMDB 服务本身的性能，采取合适的策略。

#### 12.5.1.6、查询实体事件

> List<EntityEvent> getEntityEvents(long timestamp);

- 这个方法意在获取最近一段时间内实体的变更消息，增量的去拉取变更的实体。因为 Nacos 不会实时去访问 CMDB 插件查询实体，需要这个拉取事件的方法来获取实体的更新。参数里的 timestamp 为上一次拉取事件的时间，CMDB 插件可以选择使用或者忽略这个参数。

### 12.5.2、Nacos CMDB整合

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668269294943-c6c9dd2d-76db-4595-9dd2-0c6f04133e61.png#averageHue=%234c6c47&clientId=uafbb8467-7793-4&from=paste&height=580&id=uc6c6466e&name=image.png&originHeight=580&originWidth=2362&originalType=binary&ratio=1&rotation=0&showTitle=false&size=220726&status=done&style=none&taskId=u9b20df96-cb4d-4d52-90a9-b19f75ed4a5&title=&width=2362)

#### 12.5.2.1、新建一个Maven项目

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668269201170-e8c9b142-e016-478d-8c70-373b77f68071.png#averageHue=%233d4144&clientId=uafbb8467-7793-4&from=paste&height=1240&id=u708d179c&name=image.png&originHeight=1240&originWidth=1600&originalType=binary&ratio=1&rotation=0&showTitle=false&size=225081&status=done&style=none&taskId=u1042cd00-3360-4444-b1a6-01e7d445697&title=&width=1600)

#### 12.5.2.2、pom文件添加依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.zhz</groupId>
    <artifactId>CMDB-DEMO</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>com.alibaba.nacos</groupId>
            <artifactId>nacos-api</artifactId>
            <version>1.4.1</version>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>3.0.0</version>
                <configuration>
                    <descriptorRefs>
                        <descriptorRef>jar-with-dependencies</descriptorRef>
                    </descriptorRefs>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

#### 12.5.2.3、新建一个类实现CmdbService

```java
package com.zhz.cmdb.demo;

import com.alibaba.nacos.api.cmdb.pojo.Entity;
import com.alibaba.nacos.api.cmdb.pojo.EntityEvent;
import com.alibaba.nacos.api.cmdb.pojo.Label;
import com.alibaba.nacos.api.cmdb.pojo.PreservedEntityTypes;
import com.alibaba.nacos.api.cmdb.spi.CmdbService;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author zhouhengzhe
 * @date 2022/11/12
 */
public class NacosCmdbServiceImpl implements CmdbService {

    private Map<String,Map<String,Entity>> entityMap=new ConcurrentHashMap<>();

    private Map<String,Label> labelMap=new ConcurrentHashMap<>();

    public NacosCmdbServiceImpl() {
        Label label = new Label();
        label.setName("cluster");
        Set<String> values = new HashSet<>();
        values.add("BEIJING");
        values.add("HANGZHOU");
        label.setValues(values);
        labelMap.put(label.getName(),label);
        entityMap.put(PreservedEntityTypes.ip.name(),new HashMap<>());
        Entity entity = new Entity();
        entity.setName("192.168.10.10");
        entity.setType(PreservedEntityTypes.ip.name());
        Map<String,String> labels = new HashMap<>();
        labels.put("cluster","BEIJING");
        entity.setLabels(labels);
        entityMap.get(PreservedEntityTypes.ip.name()).put(entity.getName(),entity);
        entity = new Entity();
        entity.setName("192.168.10.11");
        entity.setType(PreservedEntityTypes.ip.name());
        labels = new HashMap<>();
        labels.put("cluster","HANGZHOU");
        entity.setLabels(labels);
        entityMap.get(PreservedEntityTypes.ip.name()).put(entity.getName(),entity);
    }

    @Override
    public Set<String> getLabelNames() {
        return new HashSet<String>(){{add("cluster");}};
    }

    @Override
    public Set<String> getEntityTypes() {
        return new HashSet<String>(){{add(PreservedEntityTypes.ip.name());}};
    }

    @Override
    public Label getLabel(String labelName) {
        return labelMap.get(labelName);
    }

    @Override
    public String getLabelValue(String entityName, String entityType, String labelName) {
        return entityMap.get(entityName).get(entityName).getLabels().get(labelName);
    }

    @Override
    public Map<String, String> getLabelValues(String entityName, String entityType) {
        return entityMap.get(entityName).get(entityName).getLabels();
    }

    @Override
    public Map<String, Map<String, Entity>> getAllEntities() {
        return entityMap;
    }

    @Override
    public List<EntityEvent> getEntityEvents(long l) {
        return null;
    }

    @Override
    public Entity getEntity(String entityName, String entityType) {
        return entityMap.get(entityType).get(entityName);
    }
}

```

#### 12.5.2.4、在META-INF.services文件下创建com.alibaba.nacos.api.cmdb.spi.CmdbService

```java
com.zhz.cmdb.demo.NacosCmdbServiceImpl
```

#### 12.5.2.5、执行命令进行打包

```shell
mvn package assembly:single -Dmaven.test.skip=true
```

#### 12.5.2.6、将target目录下的包含依赖的jar包上传到Nacos CMDB插件目录：

```
{nacos.home}/plugins/cmdb
```

#### 12.5.2.7、在nacos的application.properties里打开加载插件开关

```properties
nacos.cmdb.loadDataAtStart=true
```

#### 12.5.2.8、重启nacos Server，即可加载到您实现的nacos-cmdb插件获取您的CMDB数据。

#### 12.5.2.9、使用 Selector 实现同机房优先访问

通过 CMDB 的数据就可以实现多种灵活的负载均衡策略，下面举例来说明如何使用 CMDB 数据和 Selector 来实现就近访问。

##### 12.5.2.9.1、Nacos 通过 CMDB 获取 IP 机房信息，对应的标签信息如下：

```
11.11.11.11
    site: x11

22.22.22.22
    site: x12

33.33.33.33
    site: x11

44.44.44.44
    site: x12

55.55.55.55
    site: x13
```

1. 11.11.11.11、22.22.22.22、33.33.33.33、44.44.44.44和55.55.55.55.55都包含了标签site，且它们对应的值分别为x11、x12、x11、x12、x13。
2. 我们先注册一个服务，下面挂载IP11.11.11.11和22.22.22.22。

![](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668269775550-c68685bf-d3ac-4ee0-bed8-98a848271ff5.png#averageHue=%23bdb6ab&clientId=uafbb8467-7793-4&from=paste&id=u58276186&originHeight=429&originWidth=1080&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u20c3855a-11d5-451d-9985-422e8be64d6&title=);

1. 然后我们修改服务的“服务路由类型”，并配置为基于同site优先的服务路由：

![](https://cdn.nlark.com/yuque/0/2022/png/1738514/1668269775543-650b253c-aecc-4308-b307-9d1291b3eedb.png#averageHue=%23fefdfd&clientId=uafbb8467-7793-4&from=paste&id=ue6b3407a&originHeight=856&originWidth=1080&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u187e3368-5a3a-4a6d-a0d1-368713e5b4c&title=);

1. 这里我们将服务路由类型选择为标签，然后输入标签的表达式：

> CONSUMER.label.site = PROVIDER.label.site

1. 这个表达式的格式和我们抽象的Selector机制有关，具体将会在另外一篇文章中介绍。在这里您需要记住的就是，任何一个如下格式的表达式：

> CONSUMER.label.labelName = PROVIDER.label.labelName

1. 将能够实现基于同labelName优先的负载均衡策略。
2. 然后假设服务消费者的IP分别为33.33.33.33、44.44.44.44和55.55.55.55，它们在使用如下接口查询服务实例列表：

> naming.selectInstances("nacos.test.1", true)

1. 那么不同的消费者，将获取到不同的实例列表。33.33.33.33获取到11.11.11.11，44.44.44.44将获取到22.22.22.22，而55.55.55.55将同时获取到11.11.11.11和22.22.22.22。

# 参考

- [https://blog.csdn.net/weixin_31443757/article/details/113330942](https://blog.csdn.net/weixin_31443757/article/details/113330942)
- [https://juejin.cn/post/7100913222680576008](https://juejin.cn/post/7100913222680576008)
- [https://juejin.cn/post/7100157035232264199](https://juejin.cn/post/7100157035232264199)
- [https://www.jianshu.com/p/8c2db391a4c6](https://www.jianshu.com/p/8c2db391a4c6)
- [https://cloud.tencent.com/developer/article/1751460](