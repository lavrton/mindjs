module Mapper {
    export class Eventer {
        constructor() {}
        on(eventName: string, callback?: Function, context?: any): any {}
        off(eventName?: string, callback?: Function, context?: any): any {}
        trigger(eventName: string, ...args: any[]): any {}
        bind(eventName: string, callback: Function, context?: any): any {}
        unbind(eventName?: string, callback?: Function, context?: any): any {}
    
        once(events: string, callback: Function, context?: any): any {}
        listenTo(object: any, events: string, callback: Function): any {}
        listenToOnce(object: any, events: string, callback: Function): any {}
        stopListening(object?: any, events?: string, callback?: Function): any {}
    }
}
_.extend(Mapper.Eventer.prototype, Backbone.Events);