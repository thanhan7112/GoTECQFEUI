import React from 'react'
import { BiSearch } from 'react-icons/bi'
import './header.css'

export default function Header() {
    return (
        <div className='header'>
            <div className='frame-header'>
                <div className='frame-input'>
                    <BiSearch className='icon-search-header' />
                    <input className='input-header' placeholder='Search or type a command' />
                </div>
            </div>
        </div>
    )
}
