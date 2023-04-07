# Docker

## 认识Docker

1. 大型项目组件较多，运行环境也较为复杂，部署时会碰到一些问题：

   - 依赖关系复杂，容易出现兼容性问题


   - 开发、测试、生产环境有差异

   例如一个项目中，部署时需要依赖于`node.js`、`Redis`、`RabbitMQ`、`MySQL`等，这些服务部署时所需要的函数库、依赖项各不相同，甚至会有冲突。给部署带来了极大的困难。

2. Docker解决依赖兼容问题

   Docker为了解决依赖的兼容问题的，采用了两个手段：

   - 将应用的`Libs`（函数库）、`Deps`（依赖）、配置与应用一起打包

   - 将每个应用放到一个隔离容器去运行，避免互相干扰

   这样打包好的应用包中，既包含应用本身，也保护应用所需要的`Libs`、`Deps`，无需再操作系统上安装这些，自然就不存在不同应用之间的兼容问题了。

3. 虽然解决了不同应用的兼容问题，但是开发、测试等环境会存在差异，操作系统版本也会有差异，怎么解决这些问题呢？

   - `Docker`将用户程序与所需要调用的系统(比如`Ubuntu`)函数库一起打包
   - `Docker`运行到不同操作系统时，直接基于打包的函数库，借助于操作系统的`Linux`内核来运行

4. docker和虚拟机的区别

   - `docker`是一个系统进程；虚拟机是在操作系统中的操作系统


   - `docker`体积小、启动速度快、性能好；虚拟机体积大、启动速度慢、性能一般

## Docker架构

1. 镜像与容器

   Docker中有几个重要的概念：

   - 镜像（`images`）: `Docker`将应用程序及其所需的依赖，函数库、环境、配置等文件打包在一起，称为镜像。
   - 容器（`Container`）：镜像中的应用程序运行后形成的进程就是容器，只是`Docker`会给容器进程做隔离，对外不可见。

   一切应用最终都是代码组成，都是硬盘中的一个个的字节形成的文件。只有与运行时，才会加载到内容，形成进程。

   而镜像，就是把一个应用在硬盘上的文件、及其运行环境、部分系统函数库文件一起打包形成的文件包。这个文件包是只读的。

   容器，就是把这些文件中编写的程序、函数加载到内容中允许，形成进程，只不过要隔离起来。因此一个镜像可以多次，形成多个容器进程。

   `Docker`是一个`CS`架构的程序，由两部分组成：

   - 服务端：`Docker`守护进程，负责处理`Docker`指令，管理镜像、容器等。
   - 客户端：通过命令或`RestAPI`向`Docker`服务端发送指令。可以在本地或远程向服务端发送指令。

## Docker的基本操作

### 镜像操作

- 镜像名称一般由两部分组成：`[repository]:[tag]`
- 在没有指定`tag`时，默认是`latest`,代表最新版本的镜像

![图片](/images/image-20210731155141362.png)

### 镜像命令

1. `docker push` 推送镜像到服务
2. `docker build` 构建镜像
3. `docker pull` 从服务拉取镜像
4. `docker save -o [保存的目标文件名称] [镜像名称]` 保存镜像为一个压缩包
5. `docker load -i nginx.tar` 加载压缩包为镜像
6. `docker images` 查看拉取到的镜像
7. `docker rmi`删除镜像
8. `docker search` 查询镜像

### 容器操作

容器保护三个状态：

- 运行：进程正常运行
- 暂停：进程暂停，CPU不再运行，并不释放内存
- 终止：进程终止，回收进程占用的内存、CPU等资源

### 容器命令

1. 命令

   1. `docker run`创建并允许一个容器，处于运行状态

   2. `docker pause` 让一个运行的容器暂停

   3. `docker unpause` 让一个容器从暂停状态恢复运行

   4. `docker stop` 停止一个运行的容器

   5. `docker start` 让一个停止的容器运行

   6. `docker rm` 删除一个容器

   7. `docker ps` 查看运行镜像列表

   8. `docker ps -a` 查询镜像列表

   9. `docker exec -it mn bash` 进入容器


2. 创建并运行一个容器：

   ``` bash
   docker run --name containerName -p 80:80 -d nginx
   ```

   命令解读：

   - `docker run` 创建并运行一个容器
   - `--name` 给容器起一个名字，比如mn
   - `-p` 将宿主机端口与容器端口映射，冒号左侧是宿主机端口，右侧是容器端口
   - `-d` 后台运行容器
   - `nginx` 镜像名称

3. 进入容器修改文件

   ``` bash
   docker exec -it mn bash
   ```

   命令解读：

   - `docker exec` 进入容器内部，执行一个命令
   - `-it` 给当前进入的容器创建一个标准输入、输出终端，允许我们与容器交互
   - `mn` 要进入的容器名称
   - `bash` 进入容器后执行的命令，`bash`是一个`linux`终端交互命令

   容器内部会模拟一个独立的`Linux`文件系统，看起来如同一个`Linux`服务器一样

### 数据卷

如果我们运行了`nginx`容器，那么修改`nginx`的`html`页面时，需要进入`nginx`内部，并且因为没有编辑器，修改文件也很麻烦。

这就是因为容器与数据（容器内文件）耦合带来的后果。

解决这个问题，必须将数据与容器解耦，这就要用到数据卷了。

1. 什么是数据卷

   数据卷（`volume`）是一个虚拟目录，指向宿主机文件系统中的某个目录。

   一旦完成数据卷挂载，对容器的一切操作都会作用在数据卷对应的宿主机目录了。

   这样，我们操作宿主机的`/var/lib/docker/volumes/html`目录，这就等于操作容器内的`/usr/share/nginx/html`目录了

2. 数据卷基本命令

   ``` bash
   docker volume [COMMAND]
   ```

   `docker volume`命令是数据卷操作，根据命令后跟随的`command`来确定下一步的操作：

   - `create` 创建一个`volume`
   - `inspect` 显示一个或多个`voleme`的信息
   - `ls` 列出所有的`volume`
   - `prune` 删除未使用的`volume`
   - `rm` 删除一个或多个指定的`volume`

3. 创建查看数据卷

   - 创建数据卷

     ``` bash
     docker volume create html
     ```

   - 查看所有数据

     ``` bash
     docker volume ls
     ```

   - 查看数据卷详细信息

     ``` bash
     docker volume inspect html
     ```

4. 挂载数据卷

   我们在创建容器时，可以通过-v参数来挂载一个数据卷到某个容器内目录，命令格式如下：

   ``` bash
   docker run --name mn -v html:/root/html -p 8080:80 nginx
   ```

   这里的-v就是挂载数据卷的命令：

   `-v html:/root/html` 把html数据卷挂载到容器内的`/root/html`这个目录中

   例子：挂载nginx容器内部的`/usr/share/nginx/html`目录

   ``` bash
   docker run --name mn -v html:/usr/share/nginx/html -p 80:80 -d nginx
   ```

### 容器网络

- `docker network ls` 容器网络列表
- `docker network create -d bridge mynet1` 创建自定义网络
- `docker inspect mynet1` 查看自定义网络信息
- `docker network rm mynet1` 删除网络
- `docker run -it -rm --name vm1 --network=mynet1 busybox` 使用自定义网络

## 构建Java项目

1. 新建一个空文件夹docker-demo

2. 将java程序的jara包上传到dokcer-demo

3. docker安装jdk8

4. 将docker-demo上传到虚拟机任意目录，然后进入docker-demo目录

5. 运行：

   ``` bash
   docker build -t javaweb:1.0 .
   ```

6. 最后访问`http://localhost:8090/hello/count`

   

