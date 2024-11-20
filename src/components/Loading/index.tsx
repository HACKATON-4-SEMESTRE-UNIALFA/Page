import { chaoticOrbit } from 'ldrs'

interface IProps {
    visible?: boolean
}

export const Loading = (props: IProps) => {
    chaoticOrbit.register()
    return (
        props.visible &&
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                position: 'fixed',
                zIndex: 1000,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgb(0,0,0,0.3)'
            }}
        >
            <l-chaotic-orbit
                size="100"
                speed="1.3"
                color="white"
            ></l-chaotic-orbit>
        </div>
    )
} 