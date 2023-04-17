# 1、介绍
## 1.1、概述
- 1、Nacos /nɑ:kəʊs/ 是 Dynamic Naming and Configuration Service的首字母简称，一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。
- 2、Nacos 致力于帮助您发现、配置和管理微服务。Nacos 提供了一组简单易用的特性集，帮助您快速实现动态服务发现、服务配置、服务元数据及流量管理。
- 3、Nacos 帮助您更敏捷和容易地构建、交付和管理微服务平台。 Nacos 是构建以“服务”为中心的现代应用架构 (例如微服务范式、云原生范式) 的服务基础设施。

## 1.2、关键特性包括
- 服务发现和服务健康监测 
  - Nacos 支持基于 DNS 和基于 RPC 的服务发现。服务提供者使用 原生SDK、OpenAPI、或一个独立的Agent TODO注册 Service 后，服务消费者可以使用DNS TODO 或HTTP&API查找和发现服务。 
  - Nacos 提供对服务的实时的健康检查，阻止向不健康的主机或服务实例发送请求。Nacos 支持传输层 (PING 或 TCP)和应用层 (如 HTTP、MySQL、用户自定义）的健康检查。 对于复杂的云环境和网络拓扑环境中（如 VPC、边缘网络等）服务的健康检查，Nacos 提供了 agent 上报模式和服务端主动检测2种健康检查模式。Nacos 还提供了统一的健康检查仪表盘，帮助您根据健康状态管理服务的可用性及流量。
- 动态配置服务
  - 动态配置服务可以让您以中心化、外部化和动态化的方式管理所有环境的应用配置和服务配置。 
  - 动态配置消除了配置变更时重新部署应用和服务的需要，让配置管理变得更加高效和敏捷。 
  - 配置中心化管理让实现无状态服务变得更简单，让服务按需弹性扩展变得更容易。 
  - Nacos 提供了一个简洁易用的UI (控制台样例 Demo) 帮助您管理所有的服务和应用的配置。Nacos 还提供包括配置版本跟踪、金丝雀发布、一键回滚配置以及客户端配置更新状态跟踪在内的一系列开箱即用的配置管理特性，帮助您更安全地在生产环境中管理配置变更和降低配置变更带来的风险。
- 动态DNS服务 
  - 动态 DNS 服务支持权重路由，让您更容易地实现中间层负载均衡、更灵活的路由策略、流量控制以及数据中心内网的简单DNS解析服务。动态DNS服务还能让您更容易地实现以 DNS 协议为基础的服务发现，以帮助您消除耦合到厂商私有服务发现 API 上的风险。 
  - Nacos 提供了一些简单的 DNS APIs TODO 帮助您管理服务的关联域名和可用的 IP:PORT 列表.
- 服务及其元数据管理
  - Nacos 能让您从微服务平台建设的视角管理数据中心的所有服务及元数据，包括管理服务的描述、生命周期、服务的静态依赖分析、服务的健康状态、服务的流量管理、路由及安全策略、服务的 SLA 以及最首要的 metrics 统计数据。
# 2、使用场景
![1.png](../../../public/nacos/1.png)
## 2.1、## 动态配置服务
- 动态配置服务让您能够以中心化、外部化和动态化的方式管理所有环境的配置。动态配置消除了配置变更时重新部署应用和服务的需要。配置中心化管理让实现无状态服务更简单，也让按需弹性扩展服务更容易。
## 2.2、服务发现及管理
- 动态服务发现对以服务为中心的（例如微服务和云原生）应用架构方式非常关键。Nacos支持DNS-Based和RPC-Based（Dubbo、gRPC）模式的服务发现。Nacos也提供实时健康检查，以防止将请求发往不健康的主机或服务实例。借助Nacos，您可以更容易地为您的服务实现断路器。
### 2.2.1、服务注册
- Nacos Client会通过发送REST请求的方式向Nacos Server注册自己的服务，提供自身的元数据，比如ip地 址、端口等信息。Nacos Server接收到注册请求后，就会把这些元数据信息存储在一个双层的内存Map中。
### 2.2.2、服务心跳
- 在服务注册后，Nacos Client会维护一个定时心跳来持续通知Nacos Server，说明服务一直处于可用状态，防 止被剔除。默认5s发送一次心跳。
### 2.2.3、服务同步
- Nacos Server集群之间会互相同步服务实例，用来保证服务信息的一致性。 leader raft
### 2.2.4、服务发现
- 服务消费者(Nacos Client)在调用服务提供者的服务时，会发送一个REST请求给Nacos Server，获取上面 注册的服务清单，并且缓存在Nacos Client本地，同时会在Nacos Client本地开启一个定时任务定时拉取服务端最新的注 册表信息更新到本地缓存
### 2.2.5、服务健康检查
- Nacos Server会开启一个定时任务用来检查注册服务实例的健康情况，对于超过15s没有收到客户端心跳 的实例会将它的healthy属性置为false(客户端服务发现时不会发现)，如果某个实例超过30秒没有收到心跳，直接剔除该 实例(被剔除的实例如果恢复发送心跳则会重新注册)

# ## 3.1、版本选择

![1.png](../../../public/nacos/2.png)

![1.png](../../../public/nacos/3.png)

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

![1.png](../../../public/nacos/4.png)
第三步：把**nacos\conf\cluster.conf.example**改成**nacos\conf\cluster.conf**，也就是去掉后缀.example
![1.png](../../../public/nacos/5.png)
启动

### 3.2.2、docker一键部署方式

> #安装
> 
> docker run --name nacos -e MODE=standalone -p 8848:8848 -d nacos/nacos-server:1.4.1
> #访问地址：
> 
> http://公网地址（阿里云上或者本地的虚拟机ip）:8848/nacos/

## 3.3、源码编译，本地启动

### 3.3.1、源码下载

[https://github.com/alibaba/nacos/tree/1.4.0-BETA](https://github.com/alibaba/nacos/tree/1.4.0-BETA)

### 3.3.2、开始编译，通过IDEA导入，会自动编译

### 3.3.3、导入sql

![1.png](../../../public/nacos/6.png)

### 3.3.4、修改配置文件

![1.png](../../../public/nacos/7.png)

添加配置：

```properties
db.num=1

### Connect URL of DB:
db.url.0=jdbc:mysql://localhost:3307/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user.0=root
db.password.0=root
```

### 3.3.5、启动

![1.png](../../../public/nacos/8.png)
![1.png](../../../public/nacos/9.png)
![1.png](../../../public/nacos/10.png)
### 3.3.6、运行结果

![1.png](../../../public/nacos/11.png)
![1.png](../../../public/nacos/12.png)
## 3.4、Nacos集群部署

### 3.4.1、部署图：

![1.png](../../../public/nacos/13.png)

### 3.4.2、集群启动

在本地通过3个端口模拟3台机器，端口分别是：8848，8858，
8868。

> #copy3份解压后的nacos，修改各自的application.properties中的端口号，分别为：8848， 8858，8868
> 
> server.port=8848
> 
> server.port=8858
> 
> server.port=8868


各自的conf目录下放cluster.conf文件，文件内容为：

> 192.168.66.100:8848
> 
> 192.168.66.100:8858
> 
> 192.168.66.100:8868


启动三个nacos

>  ./startup.sh


### 3.4.3、注意：

>  如果内存不够可以修改内存参数。
> 
> Xms 是指设定程序启动时占用内存大小
> 
> Xmx 是指设定程序运行期间最大可占用的内存大小
> 
> Xmn 新生代的大小

### 3.4.4、使用Nginx作负载均衡访问集群的Nacos

#### 3.4.4.1、环境安装

> yum -y install gcc make automake pcre-devel  zlib zlib-devel openssl openssl-devel

#### 3.4.4.2、安装Nginx

> ./configure
> 
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

### 4.1.1、没有配置中心的情况下配置文件管理
![1.png](../../../public/nacos/14.png)

问题：

- 配置文件数量会随着服务的增加而增加
- 单个配置文件无法区分多个运行环境
- 配置文件内容无法动态更新，需要重启服务

### 4.1.2、有配置中心的情况下配置文件管理
![1.png](../../../public/nacos/15.png)

解决了什么问题？

- 统一配置文件管理
- 提供统一标准接口，服务根据标准接口自行拉取配置
- 支持动态更新的到所有服务

## 4.2、配置中心对比

![1.png](../../../public/nacos/16.png)

### 4.2.1、Apollo

官网：
[https://www.apolloconfig.com/#/zh/README](https://www.apolloconfig.com/#/zh/README)

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
![1.png](../../../public/nacos/17.png)
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

访问地址：http://127.0.0.1:8848/nacos
新建：
![1.png](../../../public/nacos/18.png)
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

### 5.1.6、运行结果
![1.png](../../../public/nacos/19.png)
### 5.1.7、详细代码（源码）

[https://gitee.com/zhouzhz/java-system-learn/tree/master/Spring%E4%B9%8BDemo%E7%B3%BB%E5%88%97/SpringCloud-2022/nacos-config-demo](https://gitee.com/zhouzhz/java-system-learn/tree/master/Spring%E4%B9%8BDemo%E7%B3%BB%E5%88%97/SpringCloud-2022/nacos-config-demo)

## 5.2、复杂版（多环境切换）

多环境切换指的是：开发环境，测试环境，预发环境，线上环境。

### 5.2.1、nacos-config-demo-dev.yml

Nacos中的SpringBoot配置文件的**优先级**：
**bootstrap.properties>bootstrap.yaml>application.properties>application.yml**

![1.png](../../../public/nacos/20.png)
在Nacos config配置管理中新增配置如图极其对应关系如下：
![1.png](../../../public/nacos/21.png)
索要文件的格式为：${spring.application.name}-${spring.profiles.active}.${spring.cloud.nacos.config.file-extension}
所以我们可以得知再nacos中的文件名就是**nacos-config-demo-dev.yml**
配置内容为：

```yaml
testConfig: 开发配置
```

![1.png](../../../public/nacos/22.png)

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

![1.png](../../../public/nacos/23.png)

### 5.2.5、动态配置验证

动态配置验证，修改nacos文件中的配置为：
![1.png](../../../public/nacos/24.png)

### 5.2.6、动态配置验证后的运行结果

运行结果就会变成
![1.png](../../../public/nacos/25.png)

### 5.2.7、多环镜演示

假设我们的项目中的Nacos配置有n多个，如下
![1.png](../../../public/nacos/26.png)
那么我们项目中，该怎么指定的，大家想一想，我们平常中是有n多个机器的，那么我们怎么指定运行哪个配置文件呢

```java
# dev/test/uat/prod四选一
java -jar xxx.jar -Dspring.profiles.active=dev/test/uat/prod
```

### 5.2.8、解决多环境共同配置(个人觉得很少用)

![1.png](../../../public/nacos/30.png)

新建文件**nacos-config-demo.yml**
![1.png](../../../public/nacos/31.png)
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
![1.png](../../../public/nacos/32.png)
如果同一个配置项再三个配置文件中都存在且值不同，最终项目读取的是什么？
如果配置了spring.profiles.active则优先获取**nacos-config-demo-${spring.profiles.active}.yml**的值
![1.png](../../../public/nacos/33.png)
### 5.2.9、不同微服务之间相同配置如何共享

比如一些redis地址，MQ地址，服务注册中心等公共配置都是多个微服务共享的，并不属于某个微服务。配置如下
![1.png](../../../public/nacos/34.png)
Nacos Config为我们提供了两种解决方案：

#### shared-configs

![1.png](../../../public/nacos/35.png)
![1.png](../../../public/nacos/36.png)
![1.png](../../../public/nacos/37.png)
![1.png](../../../public/nacos/38.png)
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
![1.png](../../../public/nacos/39.png)
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
![1.png](../../../public/nacos/40.png)
由上面打印的日志可知

## 5.3、补充：Nacos概念

### 5.3.1、Namespace命名空间（多环境的管理与隔离）

现如今，在微服务体系中，一个系统往往被拆分为多个服务，每个服务都有自己的配置文件，然后每个系统往往还会准备开发环境、测试环境、正式环境。
![1.png](../../../public/nacos/41.png)
问题：我们来说算一算，假设某系统有10个微服务，那么至少有10个配置文件吧，三个环境（dev\test\prod），那就有30个配置文件需要进行管理。

> Namespace可以帮助我们进行多环境下的管理与隔离

#### 5.3.2.2、概念

用于进行租户粒度的配置隔离。不同的命名空间下，可以存在相同的 Group 或 Data ID 的配置。Namespace 的常用场景之一是不同环境的配置的区分隔离，例如开发测试环境和生产环境的资源（如配置、服务）隔离等。默认namespace=public的保留空间,不支持删除;默认情况下。
![1.png](../../../public/nacos/42.png)

#### 5.3.2.3、场景

Nacos给的最佳实践表明，最外层的namespace是可以用于区分部署环境的，比如test，dev，prod等。
![1.png](../../../public/nacos/43.png)
注意：命名空间可用于进行不同环境的配置隔离。一般一个环境划分到一个命名空间。

#### 5.3.2.4、如何新建Namespace

![1.png](../../../public/nacos/44.png)

#### 5.3.2.5、如何查看Namespace

![1.png](../../../public/nacos/45.png)

### 5.3.2、DataID配置（工程里的配置文件名字）

#### 5.3.2.1、概念

Nacos 中的某个配置集的 ID，配置集 ID 是组织划分配置的维度之一。Data ID 通常用于组织划分系统的配置集。一个系统或者应用可以包含多个配置集，每个配置集都可以被一个有意义的名称标识。

> 注意：
>
> - 在系统中，一个配置文件通常就是一个配置集。一般微服务的配置就是一个配置集

#### 5.3.2.2、dataId的拼接格式

![1.png](../../../public/nacos/46.png)

> 解释：
>
> - prefix：默认为 spring.application.name 的值。
> - spring.profiles.active：即为当前环境对应的 profile。
> - file-extension：文件后缀

当activeprofile为空时。
![1.png](../../../public/nacos/47.png)

#### 5.3.2.3、新建DataID步骤

![1.png](../../../public/nacos/48.png)
![1.png](../../../public/nacos/49.png)
### 5.3.3.、Group分组方案(也可以实现环境区分，跟命名空间一个作用)

#### 5.3.3.1、概念

Nacos中的一组配置集，是组织配置的维度之一。通过一个有意义的字符串对配置集进行分组，从而区分Data ID相同的配置集。当您在 Nacos上创建一个配置时，如果未填写配置分组的名称，则配置分组的名称默认采用DEFAULT_GROUP 。
![1.png](../../../public/nacos/50.png)

#### 5.3.3.2、通过Group实现环境区分
![1.png](../../../public/nacos/51.png)
![1.png](../../../public/nacos/52.png)
![1.png](../../../public/nacos/53.png)
### 5.3.4、Namespace实施方案(不同租户应对方案)

#### 5.3.4.1、实践方案

##### 5.3.4.1.1、面向一个租户

从一个租户(用户)的角度来看，如果有多套不同的环境，那么这个时候可以根据指定的环境来创建不同的 namespce，以此来实现多环境的隔离。
例如，你可能有dev，test和prod三个不同的环境，那么使用一套nacos 集群可以分别建以下三个不同的 namespace
![1.png](../../../public/nacos/54.png)

> 问题：
> 这里的单租户同样也适于小型项目，或者是项目不太多时的实施方案，通过定义不同的环境，不同环境的项目在不同的Namespace下进行管理，不同环境之间通过Namespace进行隔离。

##### 5.3.4.1.2、面向多个租户

当多个项目同时使用该Nacos集群时，还可以通过Group进行Namespace内的细化分组。这里以 Namespace：dev 为例，在Namespace中通过不同Group进行同一环境中不同项目的再分类 。
![1.png](../../../public/nacos/55.png)

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