/*
 * @Description: 状态机器
 * @Version: 2.0
 * @Autor: Yaowen Liu
 * @Date: 2021-01-11 22:26:28
 * @LastEditors: Yaowen Liu
 * @LastEditTime: 2021-01-12 12:41:25
 */
class StateMachine {
    private initialState: string;
    private possibleStates: Object;
    private stateArgs:Array<any>;
    private state?: string;

    constructor(initialState: string, possibleStates: Object, stateArgs = []) {
        this.initialState = initialState;
        this.possibleStates = possibleStates;
        this.stateArgs = stateArgs;

        Object.keys(this.possibleStates).forEach((key: string) => {
            this.possibleStates[key].stateMachine = this;
        })
    }

    step() {
        // 如果没有状态则设置为初始状态
        if (!this.state) {
            this.state = this.initialState;
            this.possibleStates[this.state].enter(...this.stateArgs);
        }

        this.possibleStates[this.state].execute(...this.stateArgs);
    }

    transition(newState, ...enterArgs) {
        this.state = newState;
        if (this.state) {
            this.possibleStates[this.state].enter(...this.stateArgs, ...enterArgs);
        }
    }
}


class State {
    stateMachine: any;
    
    enter(...args) {

    }

    execute(...args) {

    }
}

export {
    StateMachine,
    State
}