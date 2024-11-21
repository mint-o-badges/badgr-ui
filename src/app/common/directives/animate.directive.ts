import {Directive, ElementRef, HostListener, Input, Renderer2} from '@angular/core';

/*
    animation : 애니메이션 종류 이름 fadeIn, fadeInUp, fadeOut, fadeOutDown 등 (animate.css 참고)
    delay : 애니메이션 지연 시간 1초 = 1000
    duration : 애니메이션 실행 시간 1초 = 1000
    offset : 애니메이션 시작점 위치 ( 윈도우 높이 대비 0 ~ 100 (% 개념) )
    triggerOnce : true - 한번만 실행, false - 스크롤 할때마다 실행
 */
@Directive({
    selector: '[animation], [delay], [duration], [offset], [triggerOnce]'
})
export class AnimateDirective {

    //컴포넌트속성
    @Input('animation') animationClass:string = 'fadeInUp'
    @Input('delay') delay:string = '0'
    @Input('duration') duration:string

    //waypoint관련설정
    @Input('offset') wayPointOffset:string = '100'
    @Input('triggerOnce') triggerOnce:string = 'false'

    private elObj:any = null
    private windowH:number //윈도우 높이
    private elOffsetTop:number //요소의 y좌표
    private check:boolean = false //애니메이션 최초실행 체크
    private oldY:number = 0 //스크롤 방향 감지

    constructor( private el:ElementRef, private renderer:Renderer2 ) { }

    @HostListener('window:scroll', ['$event']) onScrollAnimation(event) {
        this.elOffsetTop = this.elObj.getBoundingClientRect().y

        let wayPoint = this.windowH * Number(this.wayPointOffset) / 100
        if(this.elOffsetTop > -100 && this.elOffsetTop < wayPoint) {
            //화면 안에 들어올 때 애니메이션 실행
            this.renderer.removeClass(this.elObj, 'wait-animation')
            this.check = true
        } else {
            if(this.check) {
                //한번 애니메이션이 실행된 이후에는 멈춤
                this.renderer.removeClass(this.elObj, 'animated')
                this.renderer.removeClass(this.elObj, this.animationClass)

                //스크롤이 위에서 아래로 내려갈 때만, 한번만 실행이 아닐 때만 애니메이션 반복
                if(this.elOffsetTop < this.oldY && this.triggerOnce == 'false') {
                    this.renderer.addClass(this.elObj, 'wait-animation')
                    this.renderer.addClass(this.elObj, 'animated')
                    this.renderer.addClass(this.elObj, this.animationClass)
                }
            }
        }
        this.oldY = this.elOffsetTop
    }

    //화면 리사이즈 될 때 wayPoint 비율 체크하기위해 윈도우 높이값 다시 저장
    @HostListener('window:resize', ['$event']) onResizeWindow(event) {
        this.windowH = window.innerHeight
    }

    ngOnInit() {
        this.elObj = this.el.nativeElement
        this.windowH = window.innerHeight
        this.elOffsetTop = this.elObj.offsetTop

        //애니메이션 지연 시간 설정
        if (Number(this.delay) > 0) {
            this.renderer.setStyle(this.elObj, '-webkit-animation-delay', this.delay +'ms')
            this.renderer.setStyle(this.elObj, 'animation-delay', this.delay + 'ms')
        }

        //애니메이션 실행 시간 설정
        if (Number(this.duration) > 0) {
            this.renderer.setStyle(this.elObj, '-webkit-animation-duration', this.duration + 'ms')
            this.renderer.setStyle(this.elObj, 'animation-duration', this.duration + 'ms')
        }

        //화면 로드시 애니메이션 최초 세팅
        if(this.elOffsetTop > this.windowH * Number(this.wayPointOffset) / 100) {
            this.renderer.addClass(this.elObj, 'wait-animation')
        }
        this.renderer.addClass(this.elObj, 'animated')
        this.renderer.addClass(this.elObj, this.animationClass)
    }
}

